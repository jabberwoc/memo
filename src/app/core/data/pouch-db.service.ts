import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { Observable, Subject, firstValueFrom } from 'rxjs';
import { RemoteState } from '../authentication/remote-state';
import { LoginResponse } from './model/LoginResponse';
import { MemoUser } from './model/memo-user';
import { ConfigService } from '../settings/config.service';
import { NGXLogger } from 'ngx-logger';
import { HttpClient } from '@angular/common/http';

interface UpResponse {
  status: string;
}

@Injectable()
export class PouchDbService {
  private readonly USER_DB_PREFIX = 'userdb-';

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

  public constructor(private configService: ConfigService, private logger: NGXLogger, private http: HttpClient) {
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

  public bulkCreate(documents: any[]): Promise<Array<PouchDB.Core.Response | PouchDB.Core.Error>> {
    return this.localDatabase.bulkDocs(documents);
  }

  public async remove(id: string) {
    const doc = await this.localDatabase.get(id);
    return this.localDatabase.remove(doc);
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

  public async logout(): Promise<void> {
    if (!this.remoteDatabase) {
      // not syncing
      return Promise.reject('not syncing');
    }

    await this.remoteDatabase.close()
    this.remoteDatabase = null;
    await this.openLocalDatabase();
  }

  public cancelSync(): void {
    if (this.syncHandler) {
      this.syncHandler.cancel();
    }
  }

  private async getHealth(): Promise<UpResponse> {

    const remoteUrl = this.configService.getConfigValue('remoteUrl');

    return await firstValueFrom(this.http.get<UpResponse>(
      remoteUrl + '/_up'))
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
      this.logger.debug('Remote sync: changes detected.');
      this.logger.debug(change);
      this.change.next(change);
    });
    this.syncHandler.on('paused', () => {
      this.logger.debug('Remote sync: connection paused.');
      this.stateChange.next(RemoteState.PAUSED);
    });
    this.syncHandler.on('active', () => {
      this.logger.debug('Remote sync: connection resumed.');
      this.stateChange.next(RemoteState.ACTIVE);
    });
    this.syncHandler.on('complete', info => {
      this.logger.debug('Remote sync: connection closed.');
      this.logger.debug(info);
      this.stateChange.next(RemoteState.COMPLETED);
    });
    this.syncHandler.on('error', error => {
      this.logger.error('Remote sync error: ' + JSON.stringify(error));
      this.error.next(error);
    });
  }

  public async isRemoteAlive(): Promise<boolean> {
    try {
      if (!this.remoteDatabase) {
        return false;
      }

      const { status } = await this.getHealth();
      return status == 'ok';
    } catch (_) {
      return false;
    }
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
      this.logger.debug('opened user database ' + this.USER_DB_PREFIX + userHex + ' for user: ' + user);
      this.databaseReset.next();
      return Promise.resolve(new MemoUser(user, true));
    }

    // try to connect to user database
    this.cancelSync();
    const db = new PouchDB(this.configService.getConfigValue('remoteUrl') + '/' + this.USER_DB_PREFIX + this.convertToHex(user),
      {
        skip_setup: true, auto_compaction: true
      });

    db.info().then(info => this.logger.info(info)).catch(e => this.logger.error(e));

    return Promise.resolve(new MemoUser(user, false, 'No local login possible.'));
  }

  private async openRemoteDatabase(username: string, password: string): Promise<MemoUser> {
    const remoteUrl = this.configService.getConfigValue('remoteUrl');
    if (!remoteUrl) {
      return new MemoUser(username, false, 'remoteUrl not set');
    }

    const userDbName = 'userdb-' + this.convertToHex(username);
    this.remoteDatabase = new PouchDB(remoteUrl + '/' + userDbName, {
      auth: { username: username, password: password },
      skip_setup: true
    });

    const info = await this.remoteDatabase.info()

    // runtime type check
    if (info.hasOwnProperty('error')) {
      const err = <PouchDB.Core.Error>info;
      return new MemoUser(username, false, err.reason);
    }
    return new MemoUser(username, true);
  }

  public async getAttachment(docId: string, attachmentId: string): Promise<any> {
    return await this.localDatabase.getAttachment(docId, attachmentId);
  }

  public async removeAttachment(
    docId: string,
    attachmentId: string
  ): Promise<PouchDB.Core.RemoveAttachmentResponse> {
    try {
      const doc = await this.get(docId);
      return await this.localDatabase.removeAttachment(docId, attachmentId, doc._rev);
    } catch (err) {
      this.logger.error(err);
      return Promise.reject();
    }
  }

  private convertToHex(value: string): string {
    let hex = '';
    for (let i = 0; i < value.length; i++) {
      hex += '' + value.charCodeAt(i).toString(16);
    }
    return hex;
  }
}
