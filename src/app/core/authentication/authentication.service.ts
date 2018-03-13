import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { PouchDbService } from '../data/pouch-db.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AuthenticationService {
  loggedInUser = new BehaviorSubject<string>(null);
  syncChanges: Observable<any>;

  constructor(private pouchDbService: PouchDbService) {
    this.syncChanges = pouchDbService.getChangeListener();
  }

  login(username: string, password: string): Promise<PouchDB.Authentication.LoginResponse> {
    // TODO
    const remoteUrl = localStorage.getItem('remoteUrl');
    return this.pouchDbService.login(remoteUrl, username, password).then(response => {
      if (response.ok) {
        // user logged in
        // TODO save
        this.loggedInUser.next(response.name);
        console.log('user ' + response.name + ' successfully logged in.');
        return response;
      }
    });
  }

  logout() {
    return this.pouchDbService.logout().then(response => {
      if (response.ok) {
        console.log('user ' + this.loggedInUser.getValue() + ' successfully logged out.');
        this.loggedInUser.next(null);
        return response;
      }
    });
  }
}
