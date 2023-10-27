import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthenticationService } from '../authentication.service';
import { UntypedFormControl, UntypedFormGroup, Validators, AbstractControl } from '@angular/forms';
import { animate, style, trigger, transition } from '@angular/animations';
import { Subject } from 'rxjs';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('growIn', [
      transition('void => *', [style({ height: 0 }), animate(300, style({ height: '*' }))]),
      transition('* => void', [style({ height: '*' }), animate(300, style({ height: 0 }))])
    ])
  ]
})
export class LoginComponent {
  loginForm = new UntypedFormGroup({
    username: new UntypedFormControl('', [Validators.required]),
    password: new UntypedFormControl('', [Validators.required]),
    autoLogin: new UntypedFormControl(false)
  });
  loading = false;
  error = new Subject<string>();
  get username(): AbstractControl {
    return this.loginForm.get('username');
  }
  get password(): AbstractControl {
    return this.loginForm.get('password');
  }

  constructor(
    private authenticationService: AuthenticationService,
    private logger: NGXLogger,
    public dialogRef: MatDialogRef<LoginComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  cancel(): void {
    this.dialogRef.close();
  }

  login() {
    if (!this.loginForm.valid) {
      return;
    }

    this.loading = true;

    this.authenticationService
      .login(this.username.value, this.password.value, this.loginForm.get('autoLogin').value)
      .then(response => {
        this.loading = false;
        if (response.localUser.isLoggedIn) {
          this.dialogRef.close(response.localUser.name);
        } else {
          // login failed
          this.error.next(response.remoteUser.error);
        }
      })
      .catch(error => {
        this.logger.error(error);
        this.loading = false;
        this.error.next(error);
      });
  }
}
