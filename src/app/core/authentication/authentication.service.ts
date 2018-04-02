import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { PouchDbService } from '../data/pouch-db.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ElectronService } from 'ngx-electron';

@Injectable()
export class AuthenticationService {
  loggedInUser = new BehaviorSubject<string>(null);
  syncChanges: Observable<any>;
  keytar: any;

  constructor(private pouchDbService: PouchDbService, private electronService: ElectronService) {
    this.keytar = electronService.remote.require('keytar');

    this.syncChanges = pouchDbService.getChangeListener();
    pouchDbService.getErrorListener().subscribe(_ => {
      // TODO check if logged in / auto login
      if (_.error === 'unauthorized' && this.loggedInUser.value !== null) {
        this.loggedInUser.next(null);
      }
    });

    // TODO check auto login
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

  login(
    username: string,
    password: string,
    autoLogin: boolean
  ): Promise<PouchDB.Authentication.LoginResponse> {
    // TODO
    const remoteUrl = localStorage.getItem('remoteUrl');
    if (!remoteUrl) {
      return Promise.reject('Remote Url not set');
    }
    return this.pouchDbService.login(remoteUrl, username, password).then(response => {
      if (response.ok) {
        if (autoLogin) {
          // user logged in
          this.keytar.setPassword('memo', username, password);
          localStorage.setItem('auto-login', username);
        } else {
          localStorage.setItem('auto-login', null);
        }

        this.loggedInUser.next(response.name);
        console.log('user ' + response.name + ' successfully logged in.');
        return response;
      }
    });
  }

  logout() {
    return this.pouchDbService.logout().then(response => {
      if (response.ok) {
        localStorage.setItem('auto-login', null);
        this.loggedInUser.next(null);
        console.log('user ' + this.loggedInUser.getValue() + ' successfully logged out.');
        return response;
      }
    });
  }
}
