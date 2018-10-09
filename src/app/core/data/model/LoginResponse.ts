import { MemoUser } from './memo-user';

export class LoginResponse {
  readonly remoteUser: MemoUser;
  readonly localUser: MemoUser;

  constructor(remoteUser: MemoUser, localUser: MemoUser) {
    this.remoteUser = remoteUser;
    this.localUser = localUser;
  }
}
