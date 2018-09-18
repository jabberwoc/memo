import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Note } from '../../core/data/entities/note';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.css']
})
export class NotesListComponent implements OnInit {
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

  constructor() {}

  ngOnInit() {}

  select(id: string): void {
    this.selectNote.next(id);
  }

  delete(note: Note): void {
    this.deleteNote.next(note);
  }
}
