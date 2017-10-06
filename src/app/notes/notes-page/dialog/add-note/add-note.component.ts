import { Component, OnInit, Inject } from '@angular/core';
import { MdDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.component.html',
  styleUrls: ['./add-note.component.css']
})
export class AddNoteComponent implements OnInit {


  constructor(public dialogRef: MdDialogRef<AddNoteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onCancel(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

}
