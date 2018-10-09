export class MemoUser {
  readonly name: string;
  readonly isLoggedIn: boolean;
  readonly error: string;

  constructor(name: string, isLoggedIn: boolean, error?: string) {
    this.name = name;
    this.isLoggedIn = isLoggedIn;

    if (error) {
      this.error = error;
    }
  }
}
