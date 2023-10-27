import {
  Component,
  Input,
  EventEmitter,
  Output,
  ChangeDetectionStrategy
} from '@angular/core';
import { Note } from '../../core/data/model/entities/note';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotesListComponent {
  @Input()
  bookTitle: string;

  @Input()
  notes: Array<Note>;
  @Input()
  selectedNoteId: string;

  @Output()
  selectNote = new EventEmitter<string>();
  @Output()
  deleteNote = new EventEmitter<Note>();

  constructor() { }


  select(id: string): void {
    this.selectNote.next(id);
  }

  delete(note: Note): void {
    this.deleteNote.next(note);
  }
}
