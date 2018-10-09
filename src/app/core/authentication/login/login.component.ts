import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AuthenticationService } from '../authentication.service';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { animate, style, trigger, transition } from '@angular/animations';

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
export class LoginComponent implements OnInit {
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    autoLogin: new FormControl(false)
  });
  loading = false;
  error: string;
  get username(): AbstractControl {
    return this.loginForm.get('username');
  }
  get password(): AbstractControl {
    return this.loginForm.get('password');
  }

  constructor(
    private authenticationService: AuthenticationService,
    public dialogRef: MatDialogRef<LoginComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}

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
      .then(user => {
        this.loading = false;
        if (user) {
          this.dialogRef.close(user);
        } else {
          // TODO login failed
        }
      })
      .catch(error => {
        // this.alertService.error(error);
        console.log(error);
        this.loading = false;
        this.error = error; // 'Invalid username / password';
      });
  }
}
