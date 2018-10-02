import { Component, OnInit, OnDestroy, AfterViewInit, HostBinding } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Book } from '../core/data/model/entities/book';
import { DataService } from '../core/data/data.service';
import { Note } from '../core/data/model/entities/note';
import { MatDialog } from '@angular/material';
import { AddNoteComponent } from './dialog/add-note/add-note.component';
import { MemoStore } from '../core/data/store/memo-store';
import { Store } from '@ngrx/store';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, combineLatest, skip } from 'rxjs/operators';

import {
  SetNotesAction,
  AddNoteAction,
  UpdateBookAction,
  UpdateNoteAction,
  SelectNoteAction,
  DeleteNoteAction,
  SelectBookAction,
  AddOrUpdateNoteAction
} from '../core/data/store/actions';
import { DeleteNoteComponent } from './dialog/delete-note/delete-note.component';
import Split from 'split.js';
import { MenuService, MenuName } from '../core/menu/menu.service';

@Component({
  selector: 'app-notes-page',
  templateUrl: './notes-page.component.html',
  styleUrls: ['./notes-page.component.css']
})
export class NotesPageComponent implements OnInit, AfterViewInit {
  book: Book;
  notes: Observable<Array<Note>>;
  filteredNotes: Observable<Array<Note>>;
  selectedNote: Observable<Note>;
  selectedNoteId: Observable<string>;
  selectedBook: Observable<Book>;
  noteFilter = new BehaviorSubject<string>(null);

  isSaving = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private dataService: DataService,
    private menuService: MenuService,
    private store: Store<MemoStore>
  ) {
    this.notes = this.store.select(_ => _.notes).pipe(map(_ => _.sort(Note.modifiedComparer)));
    this.filteredNotes = this.notes.pipe(
      combineLatest(this.noteFilter, (notes, filter) =>
        notes.filter(n => {
          return filter ? n.name.toLowerCase().indexOf(filter) !== -1 : true;
        })
      )
    );
    this.selectedNoteId = this.store.select(_ => _.selectedNoteId);
    this.selectedNote = this.notes.pipe(
      combineLatest(this.selectedNoteId, (notes, selectedId) => {
        return notes.find(_ => _.id === selectedId) || null;
      })
    );
    this.store
      .select(_ => _.selectedBook)
      .pipe(skip(1))
      .subscribe(book => {
        if (book === null) {
          this.router.navigate(['books']);
        } else {
          this.book = book;
          this.loadNotes(book.id);
        }
      });

    this.dataService.syncPull.subscribe(change => this.updateState(change));
    this.dataService.reset.subscribe(_ => this.closeBook());

    // register 'add note' action in menu
    this.menuService.registerMenuAction(MenuName.NOTES, () => this.addNote());
  }

  ngOnInit(): void {
    this.initRouting();
  }

  ngAfterViewInit(): void {
    const setting = localStorage.getItem('split-sizes');
    let sizes;

    if (setting) {
      sizes = JSON.parse(setting);
    } else {
      sizes = [25, 75];
    }

    const split = Split(['#app-notes-list', '#app-editor'], {
      sizes: sizes,
      minSize: 150,
      gutterSize: 5,
      onDragEnd: function() {
        localStorage.setItem('split-sizes', JSON.stringify(split.getSizes()));
      },
      elementStyle: function(dimension, size, gutterSize) {
        return {
          'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'
        };
      },
      gutterStyle: function(dimension, gutterSize) {
        return {
          'flex-basis': gutterSize + 'px'
        };
      }
    });
  }

  initRouting(): void {
    this.route.paramMap.subscribe(params => this.openBook(params.get('bookId')));
  }

  openBook(bookId: string): void {
    this.dataService
      .getBook(bookId)
      .then(book => {
        this.store.dispatch(new SelectBookAction(book));
        console.log('selected book: ' + book.name + '... loading notes..');
      })
      .catch(_ => {
        this.router.navigate(['books']);
      });
  }

  loadNotes(bookId: string): void {
    this.dataService.getNotes(bookId).then(notes => {
      this.store.dispatch(new SetNotesAction(notes));
      if (notes.length > 0) {
        this.selectNote(notes[0].id);
      }
    });
  }

  updateState(change: any): void {
    change.notes
      .filter(_ => _.book === this.book.id)
      .forEach(_ => this.store.dispatch(new AddOrUpdateNoteAction(_)));
  }

  addNote(): void {
    const dialogRef = this.dialog.open(AddNoteComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name) {
        this.dataService.createNote(new Note(null, name, this.book.id, '', null)).then(newNote => {
          if (newNote) {
            console.log('created new note: [' + newNote.id + '] ' + name);
            this.store.dispatch(new AddNoteAction(newNote));

            this.dataService.updateBookNoteCount(this.book).then(book => {
              if (book) {
                this.store.dispatch(new UpdateBookAction(book));
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
    const dialogRef = this.dialog.open(DeleteNoteComponent, { data: { name: note.name } });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed === true) {
        this.dataService.deleteNote(note).then(ok => {
          if (ok) {
            this.store.dispatch(new DeleteNoteAction(note.id));
          } else {
            console.log('error deleting book');
          }
        });
      }
    });
  }

  closeBook(): void {
    console.log('closing book: ' + this.book.id + ', name: ' + this.book.name);
    this.router.navigate(['books', this.book.id]);
  }

  updateNote(note: Note) {
    this.isSaving = true;

    this.dataService.updateNote(note).then(ok => {
      if (ok) {
        console.log('note updated: [' + note.id + '] ' + note.name);
        this.store.dispatch(new UpdateNoteAction(note));
        this.isSaving = false;
      } else {
        console.log('error updating note: ' + ok);
      }
    });
  }

  selectNote(id: string) {
    this.store.dispatch(new SelectNoteAction(id));
  }

  filter(text: string) {
    this.noteFilter.next(text.toLowerCase());
  }
}
