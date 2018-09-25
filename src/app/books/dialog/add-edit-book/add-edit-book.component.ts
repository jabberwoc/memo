import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { trigger, transition, style, animate } from '@angular/animations';
import { DialogMode } from './dialog-mode';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';

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
  addEditForm = new FormGroup({
    name: new FormControl('', [Validators.required])
  });
  get name(): AbstractControl {
    return this.addEditForm.get('name');
  }
  mode: DialogMode;
  title: string;

  constructor(
    public dialogRef: MatDialogRef<AddEditBookComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.setMode(data);
  }

  setMode(data: AddEditData): void {
    this.mode = data.mode;

    switch (this.mode) {
      case DialogMode.ADD:
        this.title = 'add book';
        break;
      case DialogMode.EDIT:
        this.title = 'edit book name';
        this.name.setValue(data.name);
        break;
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.name.invalid) {
      return;
    }
    this.dialogRef.close(this.name.value);
  }
}

export interface AddEditData {
  mode: DialogMode;
  name: string;
}
