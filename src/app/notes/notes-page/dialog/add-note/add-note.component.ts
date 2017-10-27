import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.component.html',
  styleUrls: ['./add-note.component.css']
})
export class AddNoteComponent {
  constructor(public dialogRef: MatDialogRef<AddNoteComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }
}
