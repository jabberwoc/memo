import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
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
    private router: Router,
    private authenticationService: AuthenticationService,
    public dialogRef: MatDialogRef<LoginComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}

  cancel(): void {
    this.dialogRef.close();
  }

  login() {
    console.log(this.loginForm.valid);
    if (!this.loginForm.valid) {
      return;
    }

    this.loading = true;

    this.authenticationService
      .login(this.username.value, this.password.value, this.loginForm.get('autoLogin').value)
      .then(
        response => {
          this.loading = false;
          // TODO
          console.log(response);
          this.dialogRef.close();
        },
        error => {
          // this.alertService.error(error);
          this.loading = false;
          this.error = error; // 'Invalid username / password';
        }
      );
  }
}
