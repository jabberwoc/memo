import { Injectable, EventEmitter } from '@angular/core';
import PouchDB from 'pouchdb';
import { ElectronService } from 'ngx-electron';
import { Book } from '../entities/book';
// const PouchDB = require('pouchdb'),
const path = require('path');

@Injectable()
export class PouchDbService {

  private isInstantiated: boolean;
  private database: any;
  private listener: EventEmitter<any> = new EventEmitter();

  public constructor(private electronService: ElectronService) {
    if (!this.isInstantiated) {

      if (electronService.isElectronApp) {
        this.database = electronService.remote.getGlobal('shared').db;
        console.log('database setup from electron app');

      } else {
        const books = [
          new Book('book/1', 'bla', 6),
          new Book('book/2', 'blubb', 42),
          new Book('book/3', 'hans', 7),
          new Book('book/4', 'peter', 14)
        ];

        // const db = new PouchDB(dbPath, { auto_compaction: true });
        this.database = new PouchDB('memo', { auto_compaction: true });
        books.forEach(book => this.put(book.id, { name: book.name, count: book.count }));

        console.log('database setup in browser');
      }
      this.isInstantiated = true;
    }
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
    // console.log('put: ' + id);
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

  public remove(id: string) {
    return this.database.get(id)
      .then(doc => {
        return this.database.remove(doc);
      });
  }

  public sync(remote: string) {
    // TODO
    // let remoteDatabase = new PouchDB(remote);
    // this.database.sync(remoteDatabase, {
    //   live: true
    // }).on('change', change => {
    //   this.listener.emit(change);
    // }).on('error', error => {
    //   console.error(JSON.stringify(error));
    // });
  }

  public getChangeListener() {
    return this.listener;
  }

}
