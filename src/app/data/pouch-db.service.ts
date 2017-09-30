import { Injectable, EventEmitter } from '@angular/core';
import PouchDB from 'pouchdb';
// const PouchDB = require('pouchdb'),
const path = require('path');

@Injectable()
export class PouchDbService {

  private isInstantiated: boolean;
  private database: any;
  private listener: EventEmitter<any> = new EventEmitter();

  public constructor() {
    if (!this.isInstantiated) {
      // PouchDB.debug.enable('*');
      // const dbPath = path.join(__dirname, 'db');
      // console.log('dbPath: ' + dbPath);

      // const db = new PouchDB(dbPath, { auto_compaction: true });
      const db = new PouchDB('hans', { auto_compaction: true });
      this.database = db;
      console.log('database: ' + this.database);
      this.isInstantiated = true;
    }
  }

  public fetch() {
    return this.database.allDocs({ include_docs: true });
  }

  public get(id: string) {
    return this.database.get(id);
  }

  public put(id: string, document: any) {
    document._id = id;
    return this.get(id).then(result => {
      document._rev = result._rev;
      return this.database.put(document);
    }, error => {
      if (error.status === 404) {
        return this.database.put(document);
      } else {
        return new Promise((resolve, reject) => {
          reject(error);
        });
      }
    });
  }

  public sync(remote: string) {
    let remoteDatabase = new PouchDB(remote);
    this.database.sync(remoteDatabase, {
      live: true
    }).on('change', change => {
      this.listener.emit(change);
    }).on('error', error => {
      console.error(JSON.stringify(error));
    });
  }

  public getChangeListener() {
    return this.listener;
  }

}
