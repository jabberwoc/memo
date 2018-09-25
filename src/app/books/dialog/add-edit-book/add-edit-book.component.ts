import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-edit-book',
  templateUrl: './add-edit-book.component.html',
  styleUrls: ['./add-edit-book.component.css'],
  animations: [
    trigger('growIn', [
      transition('void => *', [style({ height: 0 }), animate(300, style({ height: '*' }))]),
      transition('* => void', [style({ height: '*' }), animate(300, style({ height: 0 }))])
    ])
  ]
})
export class AddEditBookComponent {
  name = new FormControl('', [Validators.required]);
  mode: DialogMode;
  dialogMode = DialogMode;

  constructor(
    public dialogRef: MatDialogRef<AddEditBookComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.setMode(data.mode);
  }

  setMode(mode: DialogMode): void {
    this.mode = mode;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

export enum DialogMode {
  ADD = 'add',
  EDIT = 'edit'
}
