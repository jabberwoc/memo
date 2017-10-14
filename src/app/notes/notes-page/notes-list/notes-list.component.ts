import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Note } from '../../../entities/note';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.css']
})
export class NotesListComponent implements OnInit, OnChanges {

  @Input() bookTitle: string;
  @Input() notes: Array<Note>;
  @Input() selectedNoteId: string;

  @Output() selectNote = new EventEmitter<string>();
  @Output() deleteRequest = new EventEmitter<Note>();

  constructor() { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    // changes.prop contains the old and the new value...
  }

  select(id: string): void {
    // this.selectedNote = note;
    // console.log(this.selectedNote.name + ' selected.');
    this.selectNote.next(id);
  }
}
