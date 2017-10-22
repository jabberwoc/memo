import {
  Component,
  OnInit,
  OnDestroy,
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Book } from '../../entities/book';
import { DataService } from '../../data/data.service';
import { Note } from '../../entities/note';
import { MatDialog } from '@angular/material';
import { AddNoteComponent } from './dialog/add-note/add-note.component';
import { MemoStore } from '../../store/memo-store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import {
  AddNotesAction,
  AddNoteAction,
  UpdateBookAction,
  UpdateNoteAction,
  SelectNoteAction,
  DeleteNoteAction
} from '../../store/actions';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-notes-page',
  templateUrl: './notes-page.component.html',
  styleUrls: ['./notes-page.component.css'],
  animations: [
    trigger('saveState', [
      state(
        'inactive',
        style({
          opacity: 0
        })
      ),
      state(
        'active',
        style({
          opactiy: 1
        })
      ),
      // transition('inactive => active', animate('1000ms ease-in')),
      transition(
        'active => inactive',
        animate(
          1000,
          style({
            opacity: 0
          })
        )
      )
    ])
  ]
})
export class NotesPageComponent implements OnInit {
  book: Book;
  notes: Observable<Array<Note>>;
  filteredNotes: Observable<Array<Note>>;
  selectedNote: Observable<Note>;
  selectedNoteId: Observable<string>;
  noteFilter = new BehaviorSubject<string>(null);

  saveState = LoadingState.INACTIVE;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private dataService: DataService,
    private store: Store<MemoStore>
  ) {
    this.notes = this.store.select(_ => _.notes).map(_ => _.sort(Note.modifiedComparer));
    this.filteredNotes = this.notes.combineLatest(this.noteFilter, (notes, filter) =>
      notes.filter(n => {
        return filter ? n.name.indexOf(filter) !== -1 : true;
      })
    );
    this.selectedNoteId = this.store.select(_ => _.selectedNoteId);
    this.selectedNote = Observable.combineLatest(
      this.notes,
      this.selectedNoteId,
      (notes, selectedId) => {
        return notes.find(_ => _.id === selectedId) || null;
      }
    );

    this.noteFilter.subscribe(filter => console.log(filter));
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      console.log('params: + ' + params);

      this.book = new Book(params.get('bookId'), params.get('name'), 0, null);

      this.dataService.getBook(params.get('bookId')).then(book => {
        this.book = book;
        console.log('selected book: ' + this.book.name + '... loading notes..');
        this.loadNotes(this.book.id);
      });
    });
  }

  loadNotes(bookId: string): void {
    this.dataService.getNotes(bookId).then(notes => {
      this.store.dispatch(new AddNotesAction(notes));

      console.log(notes);
    });
  }

  addNote(): void {
    // TODO ngx-modialog
    const dialogRef = this.dialog.open(AddNoteComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name) {
        const newNote = new Note(null, name, this.book.id, '', null);
        this.dataService.createNote(newNote).then(ok => {
          if (ok) {
            console.log('created new note: [' + newNote.id + '] ' + name);
            this.store.dispatch(new AddNoteAction(newNote));

            // update book count
            this.book.count++;
            this.dataService.updateBook(this.book).then(done => {
              if (done) {
                this.store.dispatch(new UpdateBookAction(this.book));
              } else {
                console.log('error creating book');
              }
            });
          } else {
            console.log('error creating note');
          }
        });
      }
    });
  }

  deleteNote(note: Note): void {
    this.dataService.deleteNote(note).then(ok => {
      if (ok) {
        this.store.dispatch(new DeleteNoteAction(note.id));
      } else {
        console.log('error creating book');
      }
    });
  }

  closeBook(): void {
    console.log('closing book: ' + this.book.id + ', name: ' + this.book.name);
    this.router.navigate(['books', this.book.id]);
  }

  updateNote(note: Note) {
    // TODO save
    this.saveState = LoadingState.ACTIVE;
    this.dataService.updateNote(note).then(ok => {
      if (ok) {
        console.log('note updated: [' + note.id + '] ' + note.name);
        this.store.dispatch(new UpdateNoteAction(note));
        this.saveState = LoadingState.INACTIVE;
      } else {
        console.log('error updating note: ' + ok);
      }
    });
  }

  selectNote(id: string) {
    this.store.dispatch(new SelectNoteAction(id));
  }
}

export class LoadingState {
  static ACTIVE = 'active';
  static INACTIVE = 'inactive';
}
