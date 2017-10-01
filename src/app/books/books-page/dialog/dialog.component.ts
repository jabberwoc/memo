import { Component, OnInit } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'app-dialog',
  template: `
  <h2>Hi! I am modal dialog!</h2>
  <button md-raised-button (click)="dialogRef.close()">Close dialog</button>`
})
export class DialogComponent {
  constructor(public dialogRef: MdDialogRef<DialogComponent>) { }
}
