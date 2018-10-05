import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import PouchAuth from 'pouchdb-authentication';
import PouchAllDBs from 'pouchdb-all-dbs';
import { Observable, Subject } from 'rxjs';
PouchDB.plugin(PouchAuth).plugin(PouchAllDBs);

@Injectable()
export class PouchDbService {
  private isInstantiated: boolean;
  private localDatabase: PouchDB.Database<{}>;
  private remoteDatabase: PouchDB.Database<{}>;
  private offlineDatabase: PouchDB.Database<{}>;
  private syncHandler: PouchDB.Replication.Sync<{}>;

  // sync listeners (TOOD: types)
  private change: Subject<any> = new Subject<any>();
  private state: Subject<any> = new Subject<any>();
  private error: Subject<any> = new Subject<any>();

  private databaseReset: Subject<void> = new Subject();

  private readonly USER_DB_PREFIX = 'memo-userdb-';

  public constructor() {
    if (!this.isInstantiated) {
      this.setupDatabase();
    }
  }

  setupDatabase() {
    this.offlineDatabase = new PouchDB('memo', { auto_compaction: true });

    // offline database is default
    this.openLocalDatabase();
    this.isInstantiated = true;
  }

  public all(
    start: string,
    end: string,
    includeDocs: boolean
  ): Promise<
    Array<{
      doc?: any;
      id: string;
    }>
  > {
    return this.localDatabase
      .allDocs({
        startkey: start,
        endkey: end,
        include_docs: includeDocs
      })
      .then(result => result.rows);
  }

  public get(id: string): any {
    return this.localDatabase.get(id);
  }

  public put(id: string, document: any): Promise<boolean> {
    document._id = id;
    return this.get(id).then(
      result => {
        document._rev = result._rev;
        return this.localDatabase.put(document).then(_ => _.ok);
      },
      error => {
        if (error.status === 404) {
          return this.localDatabase.put(document).then(_ => _.ok);
        } else {
          return new Promise<boolean>((resolve, reject) => {
            return reject(error);
          });
        }
      }
    );
  }

  public bulkCreate(documents: any[]) {
    return this.localDatabase.bulkDocs(documents);
  }

  public remove(id: string) {
    return this.localDatabase.get(id).then(doc => {
      return this.localDatabase.remove(doc);
    });
  }

  public async login(
    username: string,
    password: string,
    alwaysOpenLocal: boolean = false
  ): Promise<{ remote: boolean; local: boolean }> {
    const success = await this.openRemoteDatabase(username);
    if (success) {
      const response = await this.remoteDatabase.logIn(username, password);
      if (response.ok) {
        console.log('login response:');
        console.log(response);
        if (await this.openLocalDatabase(username, true)) {
          this.sync();
          return { remote: true, local: true };
        }
        throw new Error('logged in to remote database but failed to open/create local database');
      }

      // return { remote: false, local: false };
    }

    if (alwaysOpenLocal) {
      return { remote: false, local: await this.openLocalDatabase(username) };
    }
  }

  public logout(): Promise<PouchDB.Core.BasicResponse> {
    if (!this.remoteDatabase) {
      // not syncing
      return Promise.reject('not syncing');
    }

    return this.remoteDatabase
      .logOut()
      .then(response => {
        if (response.ok) {
          this.openLocalDatabase();
        }
        return response;
      })
      .catch(error => {
        console.log(error);
        return Promise.reject('logOut failed');
      });
  }

  public cancelSync(): void {
    if (this.syncHandler) {
      this.syncHandler.cancel();
    }
  }

  private sync(): void {
    if (!this.remoteDatabase) {
      return;
    }

    this.syncHandler = this.localDatabase.sync(this.remoteDatabase, {
      live: true,
      retry: true
    });

    this.syncHandler.on('change', change => {
      console.log('Remote sync: changes detected.');
      console.log(change);
      this.change.next(change);
    });
    this.syncHandler.on('paused', () => {
      console.log('Remote sync: connection paused.');
      this.state.next('connection paused');
    });
    this.syncHandler.on('active', () => {
      console.log('Remote sync: connection resumed.');
      this.state.next('connection resumed');
    });
    this.syncHandler.on('complete', info => {
      console.log('Remote sync: connection closed.');
      this.state.next(info);
    });
    this.syncHandler.on('error', error => {
      console.error('Remote sync error: ' + JSON.stringify(error));
      this.error.next(error);
    });
  }

  public getDatabaseResetListener(): Observable<void> {
    return this.databaseReset;
  }

  public getChangeListener(): Observable<any> {
    return this.change;
  }

  public getErrorListener(): Observable<any> {
    return this.error;
  }

  private GetAllUserDbs(): Promise<Array<string>> {
    return PouchDB.allDbs().then(dbs => dbs.filter(db => db.startsWith(this.USER_DB_PREFIX)));
  }

  private openLocalDatabase(user: string = null, create: boolean = false): Promise<boolean> {
    if (!user) {
      this.cancelSync();
      // open default database
      this.localDatabase = this.offlineDatabase;
      console.log('opened offline database');
      this.databaseReset.next();
      return Promise.resolve(true);
    }

    if (create) {
      this.localDatabase = new PouchDB(this.USER_DB_PREFIX + this.convertToHex(user), {
        auto_compaction: true
      });
      console.log(
        'opened user database ' +
          this.USER_DB_PREFIX +
          this.convertToHex(user) +
          ' for user: ' +
          user
      );
      this.databaseReset.next();
      return Promise.resolve(true);
    }

    // find user database
    return this.GetAllUserDbs().then(dbs => {
      const existingDb = dbs.find(_ => _ === this.USER_DB_PREFIX + this.convertToHex(user));
      if (existingDb) {
        this.cancelSync();
        this.localDatabase = new PouchDB(existingDb, { auto_compaction: true });
        console.log(
          'opened existing user database ' +
            this.USER_DB_PREFIX +
            this.convertToHex(user) +
            ' for user: ' +
            user
        );
        this.databaseReset.next();
        return true;
      }
      return false;
    });
  }

  private openRemoteDatabase(username: string): Promise<boolean> {
    const remoteUrl = localStorage.getItem('remoteUrl');
    if (!remoteUrl) {
      return Promise.resolve(false);
    }

    const userDbName = 'userdb-' + this.convertToHex(username);
    this.remoteDatabase = new PouchDB(remoteUrl + '/' + userDbName, {
      skip_setup: true
    });

    return this.remoteDatabase
      .info()
      .then(i => {
        if (i.db_name === userDbName) {
          console.log('opened remote database ' + userDbName + ' for user: ' + username);
          return true;
        }
        return false;
      })
      .catch(_ => false);
  }

  private convertToHex(value: string): string {
    let hex = '';
    for (let i = 0; i < value.length; i++) {
      hex += '' + value.charCodeAt(i).toString(16);
    }
    return hex;
  }

  private hexToString(hex: string): string {
    let string = '';
    for (let i = 0; i < hex.length; i += 2) {
      string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return string;
  }
}
