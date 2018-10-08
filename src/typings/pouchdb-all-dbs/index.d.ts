/// <reference types="pouchdb-core" />
  
  declare namespace PouchDB {
    interface Static {
      allDbs(callback: (err: any, dbs: string[]) => void): void;
      allDbs(): Promise<string[]>;
  
      resetAllDbs(callback: (err: any) => void): void;
      resetAllDbs(): Promise<void>;
    }
  }

  declare module 'pouchdb-all-dbs' {
    const plugin: PouchDB.Plugin;
    export = plugin;
  }
  