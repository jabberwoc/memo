import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Book } from '../../entities/book';
import { DataService } from '../../data/data.service';
import { Note } from '../../entities/note';
import { MdDialog } from '@angular/material';
import { AddNoteComponent } from './dialog/add-note/add-note.component';
import { NoteStore, CREATE_NOTE, UPDATE_NOTE, SELECT_NOTE, ADD_NOTES } from '../../store/note-store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

@Component({
  selector: 'app-notes-page',
  templateUrl: './notes-page.component.html',
  styleUrls: ['./notes-page.component.css']
})
export class NotesPageComponent implements OnInit, OnDestroy {

  subscription: any;
  book: Book;
  notes: Observable<Array<Note>>;
  selectedNote: Observable<Note>;
  selectedNoteId: Observable<string>;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private dialog: MdDialog,
    private dataService: DataService,
    private store: Store<NoteStore>) {
    this.notes = this.store.select(_ => _.notes);
    this.selectedNoteId = this.store.select(_ => _.selectedNoteId);
    this.selectedNote = Observable.combineLatest(this.notes, this.selectedNoteId,
      (notes, selectedId) => {
        return notes.find(_ => _.id === selectedId) || null;
      });
    this.notes.subscribe((n) => this.onNoteChanged(n));
    // this.selectedNote = this.store.select(_ => _.selectedNote);
    // this.selectedNote.subscribe(_ => this.onNoteChanged(_));
  }

  onNoteChanged(note: Array<Note>) {
    console.log(note);
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params => {
      console.log('params: + ' + params);

      this.book = new Book(params.get('bookId'), params.get('name'), 0);

      this.dataService.getBook(params.get('bookId'))
        .then(book => {
          this.book = book;
          console.log('selected book: ' + this.book.name + '... loading notes..');
          this.loadNotes(this.book.id);
        });

    }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadNotes(bookId: string): void {
    this.dataService.getNotes(bookId)
      .then(notes => {
        this.store.dispatch({
          type: ADD_NOTES, payload: notes
        });

        // this.notes = notes;
        console.log(notes);
      });
  }

  addNote(): void {
    // TODO ngx-modialog
    const dialogRef = this.dialog.open(AddNoteComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name) {
        const newNote = new Note(null, name, this.book.id, '', null);
        this.dataService.createNote(newNote)
          .then(ok => {
            if (ok) {
              console.log('created new note: [' + newNote.id + '] ' + name);
              // this.notes.push(newNote);
              this.store.dispatch({
                type: CREATE_NOTE, payload: newNote
              });

              // TODO update book
            } else {
              console.log('error creating book: ' + ok);
            }
          });
      }
    });
  }

  closeBook(): void {
    console.log('closing book: ' + this.book.id + ', name: ' + this.book.name);
    this.router.navigate(['books', this.book.id]);
  }

  changeNote(note: Note) {
    this.store.dispatch({ type: UPDATE_NOTE, payload: note });
    // TODO save
  }

  selectNote(id: string) {
    this.store.dispatch({ type: SELECT_NOTE, payload: id });
    // TODO save
  }
}
