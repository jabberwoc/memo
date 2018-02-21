import { Injectable, EventEmitter } from '@angular/core';
import PouchDB from 'pouchdb';
import PouchAuth from 'pouchdb-authentication';
import { ElectronService } from 'ngx-electron';
import { Book } from './entities/book';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
const path = require('path');
PouchDB.plugin(PouchAuth);

@Injectable()
export class PouchDbService {
  private isInstantiated: boolean;
  private remoteDatabase: PouchDB.Database<{}>;
  private database: any;
  private listener: Subject<any> = new Subject<any>();
  private dbName = 'memo';

  public constructor(private electronService: ElectronService) {
    if (!this.isInstantiated) {
      // if (electronService.isElectronApp) {
      //   this.database = electronService.remote.getGlobal('shared').db;
      //   console.log('database setup from electron app');

      // } else {
      //   this.database = new PouchDB('memo', { auto_compaction: true });
      //   console.log('database setup in browser');
      // }

      this.setupDatabase();
    }
  }

  setupDatabase() {
    this.database = new PouchDB('memo', { auto_compaction: true });

    // replicate
    const remoteUrl = 'http://localhost:5984/' + this.dbName;
    const remoteDB = new PouchDB(remoteUrl);
    this.database.replicate
      .to(remoteDB)
      .on('complete', function() {
        console.log('replicating to ' + remoteUrl);
      })
      .on('error', function(err) {
        console.log('replication failed. not syncing to remote db.');
      });

    this.isInstantiated = true;
  }

  public all(start: string, end: string, includeDocs: boolean) {
    return this.database.allDocs({
      startkey: start,
      endkey: end,
      include_docs: includeDocs
    });
  }

  public get(id: string) {
    return this.database.get(id);
  }

  public put(id: string, document: any) {
    document._id = id;
    return this.get(id).then(
      result => {
        document._rev = result._rev;
        return this.database.put(document);
      },
      error => {
        if (error.status === 404) {
          return this.database.put(document);
        } else {
          return new Promise((resolve, reject) => {
            reject(error);
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

  private sync() {
    if (!this.remoteDatabase) {
      return;
    }

    this.database
      .sync(this.remoteDatabase, {
        live: true
      })
      .on('change', change => {
        this.listener.next(change);
      })
      .on('error', error => {
        console.error(JSON.stringify(error));
      });
  }

  public getChangeListener(): Observable<any> {
    return this.listener;
  }

  private convertToHex(value: string) {
    let hex = '';
    for (let i = 0; i < value.length; i++) {
      hex += '' + value.charCodeAt(i).toString(16);
    }
    return hex;
  }
}
