import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subscription, timer, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PouchDbService } from '../data/pouch-db.service';
import { ElectronService } from 'ngx-electron';
import { MemoUser } from '../data/model/memo-user';
import { RemoteState } from './remote-state';
import { NotifierService } from 'angular-notifier';
import { NGXLogger } from 'ngx-logger';

@Injectable()
export class AuthenticationService {
  currentUser = new BehaviorSubject<MemoUser>(null);
  syncChanges: Observable<any>;
  private keytar: any;
  remoteState: Observable<RemoteState>;
  private aliveSubscription: Subscription;
  private isAliveSubject = new Subject<boolean>();
  get isAlive(): Observable<boolean> {
    return this.isAliveSubject.asObservable();
  }

  constructor(
    private pouchDbService: PouchDbService,
    private electronService: ElectronService,
    private logger: NGXLogger
  ) {
    this.keytar = this.electronService.remote.require('keytar');

    this.syncChanges = this.pouchDbService.onChange;
    this.remoteState = this.pouchDbService.onStateChange;
    pouchDbService.onError.subscribe(err => {
      this.logger.debug('error syncing remote:');
      this.logger.debug(err);

      // was logged in
      const currentUser = this.currentUser.value;
      if (err.error === 'unauthorized' && currentUser !== null) {
        this.currentUser.next(null);

        // try auto login for previously logged in user
        // TODO retry count
        this.autoLogin(currentUser.name);
      }
    });

    // check auto login
    const user = localStorage.getItem('auto-login');
    if (user) {
      this.autoLogin(user);
    }

    this.setupRemoteAliveCheck();
  }

  private setupRemoteAliveCheck(): void {
    this.currentUser.subscribe(user => {
      if (this.aliveSubscription) {
        this.aliveSubscription.unsubscribe();
      }

      if (user == null) {
        return;
      }

      this.aliveSubscription = timer(0, 5000).subscribe(async _ =>
        this.isAliveSubject.next(await this.pouchDbService.isRemoteAlive(user.name))
      );
    });
  }

  autoLogin(user: string): void {
    this.keytar.getPassword('memo', user).then(password => {
      if (password) {
        this.login(user, password, true);
      } else {
        localStorage.setItem('auto-login', null);
      }
    });
  }

  async login(username: string, password: string, autoLogin: boolean): Promise<MemoUser> {
    let user: MemoUser = null;

    try {
      const ok = await this.pouchDbService.login(username, password, true);
      if (ok.remote) {
        // syncing with remote
        if (autoLogin) {
          this.keytar.setPassword('memo', username, password);
          localStorage.setItem('auto-login', username);
        } else {
          localStorage.setItem('auto-login', null);
        }
        user = new MemoUser(username, true);
        this.currentUser.next(user);
        this.logger.debug(`user ${username} successfully logged in.`);
      } else {
        // not syncing
        if (ok.local) {
          this.logger.debug(`user ${username} failed to log in. local log-in only!`);
          user = new MemoUser(username, false);
          this.currentUser.next(user);
        }
      }
      return user;
    } catch (err) {
      this.logger.debug(`user ${username} failed to log in:`);
      this.logger.debug(err);
      return null;
    }
  }

  async logout() {
    const response = await this.pouchDbService.logout();
    if (response.ok) {
      localStorage.setItem('auto-login', null);
      this.currentUser.next(null);
      this.logger.debug(`user ${this.currentUser.getValue()} successfully logged out.`);
      return response;
    }
  }
}
