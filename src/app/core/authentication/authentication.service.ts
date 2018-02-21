import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { PouchDbService } from '../data/pouch-db.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AuthenticationService {
  isLoggedIn = new BehaviorSubject<boolean>(false);

  constructor(private pouchDbService: PouchDbService) {}

  login(username: string, password: string): Promise<PouchDB.Authentication.LoginResponse> {
    // TODO
    const remoteUrl = localStorage.getItem('remoteUrl');
    return this.pouchDbService.login(remoteUrl, username, password).then(response => {
      if (response.ok) {
        // user logged in
        // TODO save
        this.isLoggedIn.next(true);
        console.log('user ' + response.name + ' successfully logged in.');
        return response;
      }
    });
  }
}
