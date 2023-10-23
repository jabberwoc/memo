import { Injectable, OnInit } from '@angular/core';
import { Observable, BehaviorSubject, Subscription, timer, Subject, interval } from 'rxjs';
import { PouchDbService } from '../data/pouch-db.service';
import { MemoUser } from '../data/model/memo-user';
import { RemoteState } from './remote-state';
import { NotifierService } from 'angular-notifier';
import { NGXLogger } from 'ngx-logger';
import { LoginResponse } from '../data/model/LoginResponse';
import { Router } from '@angular/router';
import { switchMap, map, filter } from 'rxjs/operators';
import { ElectronService } from '../../electron.service';

@Injectable()
export class AuthenticationService implements OnInit {
  currentUser = new BehaviorSubject<MemoUser>(null);
  syncChanges: Observable<any>;
  // private store: any;
  remoteState: Observable<RemoteState>;
  private isAliveSubject = new Subject<boolean>();
  get isAlive(): Observable<boolean> {
    return this.isAliveSubject.asObservable();
  }

  constructor(
    private pouchDbService: PouchDbService,
    private electronService: ElectronService,
    private logger: NGXLogger,
    private notifier: NotifierService,
    private router: Router
  ) {

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
    this.setupUserChangedRouting();
  }
  ngOnInit(): void {
    // TODO move auto login here
  }

  private setupRemoteAliveCheck(): void {
    this.currentUser
      .pipe(
        switchMap(user =>
          // interval(5000)
          timer(0, 5000)
            .pipe(
              map(_ => user),
              filter(_ => _ != null)
            )
        )
      )
      .subscribe(async _ =>
        this.isAliveSubject.next(await this.pouchDbService.isRemoteAlive())
      );
  }

  private setupUserChangedRouting(): void {
    this.currentUser.subscribe(user => {
      const username = user ? user.name : 'local';
      const storage = localStorage.getItem('previousRoutes');
      const previousRoutes = storage ? JSON.parse(storage) : {};

      if (previousRoutes[username]) {
        const prevRoute = previousRoutes[username];
        this.logger.debug(`[routing] to ${prevRoute} (previous route)`);
        this.router.navigateByUrl(this.router.parseUrl(prevRoute));
      } else {
        this.logger.debug('[routing] to /');
        this.router.navigate(['/']);
      }
    });
  }

  private async autoLogin(user: string) {
    if (!this.electronService.isElectron) {
      return;
    }

    const password = await this.getPassword(user);
    if (password) {
      await this.login(user, password, true);
    } else {
      localStorage.removeItem('auto-login');
    }
  }

  public async login(
    username: string,
    password: string,
    autoLogin: boolean
  ): Promise<LoginResponse> {
    const response = await this.pouchDbService.login(username, password);
    if (response.remoteUser.isLoggedIn) {
      // syncing with remote
      if (autoLogin) {
        if (this.electronService.isElectron) {
          this.saveAuth(username, password);

        }
        localStorage.setItem('auto-login', username);
      } else {
        localStorage.removeItem('auto-login');
      }
      this.currentUser.next(response.remoteUser);
      const message = `${response.remoteUser.name} logged in successfully`;
      this.logger.debug(message);
      this.notifier.notify('success', message);
    } else {
      // not syncing
      if (response.localUser.isLoggedIn) {
        this.currentUser.next(response.localUser);
        this.logger.debug(`${response.localUser.name} failed to log in. local log-in only!`);
        this.notifier.notify(
          'warning',
          `${response.localUser.name} logged in locally. ${response.remoteUser.error}`
        );
      } else {
        this.logger.debug(`${username} failed to log in`);
      }
    }
    return response;
  }

  async logout() {
    await this.pouchDbService.logout();

    localStorage.setItem('auto-login', null);
    this.currentUser.next(null);
    this.logger.debug(`user ${this.currentUser.getValue()} successfully logged out.`);
  }

  saveAuth(username: string, password: string): void {
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.invoke('saveAutoLogin', {
        'username': username,
        'password': password
      });
    }
  }

  async getPassword(username: string): Promise<string> {
    if (this.electronService.isElectron) {
      this.logger.debug('trying auto-login for user: ' + username);
      return await this.electronService.ipcRenderer.invoke('getAutoLogin', username);
    }
  }

}
