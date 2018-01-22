import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthenticationService {
  constructor() {}

  login(username: string, password: string): Observable<boolean> {
    // TODO
    return Observable.of(true);
  }
}
