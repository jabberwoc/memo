import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  model: any = {};
  loading = false;
  error: string;

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
    this.loading = true;
    console.log(this.model);
    this.authenticationService
      .login(this.model.username, this.model.password, this.model.autoLogin)
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
