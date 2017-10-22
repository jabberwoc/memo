import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Note } from '../../../../entities/note';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-delete-note',
  templateUrl: './delete-note.component.html',
  styleUrls: ['./delete-note.component.css']
})
export class DeleteNoteComponent implements OnInit {
  @ViewChild('deleteNoteDialog') private dialog: ElementRef;

  @Output() deleteConfirmed = new EventEmitter<Note>();
  note: Note;

  constructor() {}

  ngOnInit() {}

  close(ok: boolean) {
    if (ok) {
      this.deleteConfirmed.next(this.note);
    }

    this.dialog.nativeElement.close();
  }

  public open(note: Note) {
    this.note = note;
    this.dialog.nativeElement.showModal();
  }
}
