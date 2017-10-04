import { Component, OnInit, Inject } from '@angular/core';
import { MdDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-dialog',
  templateUrl: './add-book.component.html'
})
export class AddBookComponent {


  constructor(public dialogRef: MdDialogRef<AddBookComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onCancel(): void {
    this.dialogRef.close();
  }


}
