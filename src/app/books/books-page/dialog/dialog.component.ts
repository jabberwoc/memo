import { Component, OnInit, Inject } from '@angular/core';
import { MdDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html'
})
export class DialogComponent {


  constructor(public dialogRef: MdDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  // TODO
  confirm() {
    // this.dialogRef.close(this.name);
  }


  onCancel(): void {
    this.dialogRef.close();
  }


}
