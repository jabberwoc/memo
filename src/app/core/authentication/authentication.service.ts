import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { PouchDbService } from '../data/pouch-db.service';
import { ElectronService } from 'ngx-electron';
import { MemoUser } from '../data/model/memo-user';

@Injectable()
export class AuthenticationService {
  currentUser = new BehaviorSubject<MemoUser>(null);
  syncChanges: Observable<any>;
  keytar: any;

  constructor(private pouchDbService: PouchDbService, private electronService: ElectronService) {
    this.keytar = this.electronService.remote.require('keytar');

    this.syncChanges = pouchDbService.getChangeListener();
    pouchDbService.getErrorListener().subscribe(_ => {
      console.log('error syncing remote:');
      console.log(_);

      // was logged in
      const currentUser = this.currentUser.value;
      if (_.error === 'unauthorized' && currentUser !== null) {
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

  login(username: string, password: string, autoLogin: boolean): Promise<MemoUser> {
    // TODO
    const remoteUrl = localStorage.getItem('remoteUrl');
    if (!remoteUrl) {
      return Promise.reject('Remote Url not set');
    }

    let user: MemoUser = null;

    return this.pouchDbService
      .login(remoteUrl, username, password)
      .then(response => {
        if (response.ok) {
          // syncing with remote
          if (autoLogin) {
            this.keytar.setPassword('memo', username, password);
            localStorage.setItem('auto-login', username);
          } else {
            localStorage.setItem('auto-login', null);
          }

          user = new MemoUser(response.name, true);
          this.currentUser.next(user);
          console.log('user ' + response.name + ' successfully logged in.');
        } else {
          // not syncing
          console.log('user ' + username + ' failed to log in.');
          user = new MemoUser(username, false);
          this.currentUser.next(user);
        }

        return user;
      })
      .catch(error => {
        console.log('user ' + username + ' failed to log in:');
        console.log(error);
        return user;
      });
  }

  logout() {
    return this.pouchDbService.logout().then(response => {
      if (response.ok) {
        localStorage.setItem('auto-login', null);
        this.currentUser.next(null);
        console.log('user ' + this.currentUser.getValue() + ' successfully logged out.');
        return response;
      }
    });
  }
}
