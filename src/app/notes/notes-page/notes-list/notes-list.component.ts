import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Note } from '../../../entities/note';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.css']
})
export class NotesListComponent implements OnInit {

  @Input() bookTitle: string;
  @Input() notes: Array<Note> = [];
  @Output() deleteRequest = new EventEmitter<Note>();

  @Input() selectedNote: Note;
  @Output() selectNote = new EventEmitter<Note>();

  constructor() { }

  ngOnInit() { }

  select(note: Note): void {
    // this.selectedNote = note;
    // console.log(this.selectedNote.name + ' selected.');
    this.selectNote.next(note);
  }
}
