import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import PouchAuth from 'pouchdb-authentication';
import PouchAllDBs from 'pouchdb-all-dbs';
import { Observable, Subject } from 'rxjs';
import { RemoteState } from '../authentication/remote-state';
import { LoginResponse } from './model/LoginResponse';
import { MemoUser } from './model/memo-user';
PouchDB.plugin(PouchAuth).plugin(PouchAllDBs);

@Injectable()
export class PouchDbService {
  private readonly USER_DB_PREFIX = 'memo-userdb-';

  private isInstantiated: boolean;
  private localDatabase: PouchDB.Database<{}>;
  private remoteDatabase: PouchDB.Database<{}>;
  private offlineDatabase: PouchDB.Database<{}>;
  private syncHandler: PouchDB.Replication.Sync<{}>;

  private change: Subject<PouchDB.Replication.SyncResult<{}>> = new Subject<
    PouchDB.Replication.SyncResult<{}>
  >();
  private stateChange: Subject<RemoteState> = new Subject<RemoteState>();
  private error: Subject<any> = new Subject<any>();
  private databaseReset: Subject<void> = new Subject();

  public get onDatabaseReset(): Observable<void> {
    return this.databaseReset.asObservable();
  }
  public get onChange(): Observable<PouchDB.Replication.SyncResult<{}>> {
    return this.change.asObservable();
  }
  public get onError(): Observable<any> {
    return this.error.asObservable();
  }
  public get onStateChange(): Observable<RemoteState> {
    return this.stateChange.asObservable();
  }

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

  public async login(username: string, password: string): Promise<LoginResponse> {
    let localUser: MemoUser;
    const remoteUser = await this.openRemoteDatabase(username, password);
    if (remoteUser.isLoggedIn) {
      // logged in remotely
      localUser = await this.openLocalDatabase(username, true);
      if (localUser.isLoggedIn) {
        // remote and local => sync
        this.sync();
      }
      return new LoginResponse(remoteUser, localUser);
    } else {
      // not logged in remotely
      // try local
      localUser = await this.openLocalDatabase(username);
      return new LoginResponse(remoteUser, localUser);
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
        console.log('logOut failed: ' + error);
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
      this.stateChange.next(RemoteState.PAUSED);
    });
    this.syncHandler.on('active', () => {
      console.log('Remote sync: connection resumed.');
      this.stateChange.next(RemoteState.ACTIVE);
    });
    this.syncHandler.on('complete', info => {
      console.log('Remote sync: connection closed.');
      console.log(info);
      this.stateChange.next(RemoteState.COMPLETED);
    });
    this.syncHandler.on('error', error => {
      console.error('Remote sync error: ' + JSON.stringify(error));
      this.error.next(error);
    });
  }

  public isRemoteAlive(user?: string): Promise<boolean> {
    return this.remoteDatabase
      .getSession()
      .then(_ => {
        if (_.ok && _.userCtx) {
          if (user) {
            return _.userCtx.name === user;
          }
          return _.userCtx.name ? true : false;
        }
      })
      .catch(_ => false);
  }

  private GetAllUserDbs(): Promise<Array<string>> {
    return PouchDB.allDbs().then(dbs => dbs.filter(db => db.startsWith(this.USER_DB_PREFIX)));
  }

  private openLocalDatabase(user: string = null, create: boolean = false): Promise<MemoUser> {
    if (!user) {
      this.cancelSync();
      // open offline database
      this.localDatabase = this.offlineDatabase;
      this.databaseReset.next();
      return Promise.resolve(new MemoUser(null, true));
    }

    if (create) {
      const userHex = this.convertToHex(user);
      this.localDatabase = new PouchDB(this.USER_DB_PREFIX + userHex, {
        auto_compaction: true
      });
      console.log('opened user database ' + this.USER_DB_PREFIX + userHex + ' for user: ' + user);
      this.databaseReset.next();
      return Promise.resolve(new MemoUser(user, true));
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
        return new MemoUser(user, true);
      }
      return new MemoUser(user, false, 'No local login possible.');
    });
  }

  private async openRemoteDatabase(username: string, password: string): Promise<MemoUser> {
    const remoteUrl = localStorage.getItem('remoteUrl');
    if (!remoteUrl) {
      return new MemoUser(username, false, 'remoteUrl not set');
    }

    try {
      const userDbName = 'userdb-' + this.convertToHex(username);
      this.remoteDatabase = new PouchDB(remoteUrl + '/' + userDbName, {
        skip_setup: true
      });

      const response = await this.remoteDatabase.logIn(username, password);
      return new MemoUser(response.name, response.ok);
    } catch (err) {
      return new MemoUser(username, false, err.message);
    }
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
