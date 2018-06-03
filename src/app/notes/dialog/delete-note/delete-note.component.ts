import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ViewChild,
  ElementRef,
  Inject
} from '@angular/core';
import { Note } from '../../../core/data/entities/note';
import { Observable } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-delete-note',
  templateUrl: './delete-note.component.html',
  styleUrls: ['./delete-note.component.css']
})
export class DeleteNoteComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteNoteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
