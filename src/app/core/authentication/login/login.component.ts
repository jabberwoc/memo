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
    this.authenticationService.login(this.model.username, this.model.password).then(
      response => {
        // TODO
        console.log(response);
        this.dialogRef.close();
      },
      error => {
        // TODO report error
        // this.alertService.error(error);
        this.error = 'Invalid username / password';
      }
    );

    this.loading = false;
  }
}
