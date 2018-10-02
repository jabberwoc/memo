export class MemoUser {
  readonly name: string;
  readonly isLoggedIn: boolean;

  constructor(name: string, isLoggedIn: boolean) {
    this.name = name;
    this.isLoggedIn = isLoggedIn;
  }
}
