import { Injectable, EventEmitter } from '@angular/core';
import PouchDB from 'pouchdb';
import PouchAuth from 'pouchdb-authentication';
import { Observable, Subject } from 'rxjs';
PouchDB.plugin(PouchAuth);

@Injectable()
export class PouchDbService {
  private isInstantiated: boolean;
  private remoteDatabase: PouchDB.Database<{}>;
  private database: PouchDB.Database<{}>;
  private syncHandler: PouchDB.Replication.Sync<{}>;

  // sync listeners (TOOD: types)
  private change: Subject<any> = new Subject<any>();
  private state: Subject<any> = new Subject<any>();
  private error: Subject<any> = new Subject<any>();

  public constructor() {
    if (!this.isInstantiated) {
      this.setupDatabase();
    }
  }

  setupDatabase() {
    this.database = new PouchDB('memo', { auto_compaction: true });
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
    return this.database
      .allDocs({
        startkey: start,
        endkey: end,
        include_docs: includeDocs
      })
      .then(result => result.rows);
  }

  public get(id: string): any {
    return this.database.get(id);
  }

  public put(id: string, document: any): Promise<boolean> {
    document._id = id;
    return this.get(id).then(
      result => {
        document._rev = result._rev;
        return this.database.put(document).then(_ => _.ok);
      },
      error => {
        if (error.status === 404) {
          return this.database.put(document).then(_ => _.ok);
        } else {
          return new Promise<boolean>((resolve, reject) => {
            return reject(error);
          });
        }
      }
    );
  }

  public bulkCreate(documents: any[]) {
    return this.database.bulkDocs(documents);
  }

  public remove(id: string) {
    return this.database.get(id).then(doc => {
      return this.database.remove(doc);
    });
  }

  public login(
    remoteUrl: string,
    username: string,
    password: string
  ): Promise<PouchDB.Authentication.LoginResponse> {
    if (!remoteUrl) {
      return;
    }

    this.remoteDatabase = new PouchDB(remoteUrl + '/userdb-' + this.convertToHex(username), {
      skip_setup: true
    });
    return this.remoteDatabase.logIn(username, password).then(response => {
      if (response.ok) {
        this.sync();
        return response;
      }
    });
  }

  public logout(): Promise<PouchDB.Core.BasicResponse> {
    if (!this.remoteDatabase) {
      // not syncing
      return;
    }

    this.syncHandler.cancel();
    return this.remoteDatabase.logOut();
  }

  private sync(): void {
    if (!this.remoteDatabase) {
      return;
    }

    this.syncHandler = this.database.sync(this.remoteDatabase, {
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

  public getChangeListener(): Observable<any> {
    return this.change;
  }

  public getErrorListener(): Observable<any> {
    return this.error;
  }

  private convertToHex(value: string): string {
    let hex = '';
    for (let i = 0; i < value.length; i++) {
      hex += '' + value.charCodeAt(i).toString(16);
    }
    return hex;
  }
}
