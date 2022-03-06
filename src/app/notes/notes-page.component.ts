import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Book } from '../core/data/model/entities/book';
import { DataService } from '../core/data/data.service';
import { Note, AttachmentId } from '../core/data/model/entities/note';
import { MatDialog } from '@angular/material/dialog';
import { AddNoteComponent } from './dialog/add-note/add-note.component';
import { MemoStore } from '../core/data/store/memo-store';
import { Store } from '@ngrx/store';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { map, combineLatest, skip } from 'rxjs/operators';
import { saveAs } from 'file-saver';

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
import { ConfirmDeleteComponent } from './dialog/confirm-delete/confirm-delete.component';
import Split from 'split.js';
import { MenuService, MenuName } from '../core/menu/menu.service';
import { NGXLogger } from 'ngx-logger';
import { AttachmentAction, AttachmentActionType } from './type/attachment-action';

@Component({
  selector: 'app-notes-page',
  templateUrl: './notes-page.component.html',
  styleUrls: ['./notes-page.component.css']
})
export class NotesPageComponent implements OnInit, AfterViewInit, OnDestroy {
  book: Book;
  notes: Observable<Array<Note>>;
  filteredNotes: Observable<Array<Note>>;
  selectedNote: Observable<Note>;
  selectedNoteId: Observable<string>;
  selectedBook: Observable<Book>;
  noteFilter = new BehaviorSubject<string>(null);

  isSaving = false;
  routingSub: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private dataService: DataService,
    private menuService: MenuService,
    private store: Store<MemoStore>,
    private logger: NGXLogger
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
        const selectedNote = notes.find(_ => _.id === selectedId);
        if (!selectedNote && notes.length > 0) {
          this.selectNote(notes[0].id);
        }
        return selectedNote || null;
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

    // register 'add note' action in menu
    this.menuService.registerMenuAction(MenuName.NOTES, () => this.addNote());
  }

  ngOnInit(): void {
    this.initRouting();
  }

  ngOnDestroy(): void {
    if (this.routingSub) {
      this.routingSub.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    const setting = localStorage.getItem('split-sizes');
    let sizes: number[];

    if (setting) {
      sizes = JSON.parse(setting);
    } else {
      sizes = [25, 75];
    }

    const split = Split(['#app-notes-list', '#app-editor'], {
      sizes: sizes,
      minSize: 150,
      gutterSize: 5,
      onDragEnd: () => localStorage.setItem('split-sizes', JSON.stringify(split.getSizes())),
      elementStyle: (_: any, size: string, gutterSize: string) => ({
        'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'
      }),
      gutterStyle: (_: any, gutterSize: string) => ({
        'flex-basis': gutterSize + 'px'
      })
    });
  }

  initRouting(): void {
    this.routingSub = this.route.paramMap.subscribe(params => {
      this.openBook(params.get('bookId'), params.get('noteId'));
    });
  }

  openBook(bookId: string, noteId?: string): void {
    if (this.book && this.book.id === bookId) {
      if (noteId) {
        this.selectNote(noteId);
      }
      return;
    }

    this.dataService
      .getBook(bookId)
      .then(book => {
        // book
        this.selectBook(book);

        // note
        if (noteId) {
          this.selectNote(noteId);
        }
      })
      .catch(_ => {
        this.router.navigate(['books']);
      });
  }

  private loadNotes(bookId: string): void {
    this.store.dispatch(new SetNotesAction([]));
    this.dataService.getNotes(bookId).then(notes => this.store.dispatch(new SetNotesAction(notes)));
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
            this.logger.debug(`created new note: [${newNote.id}] ${name}`);
            this.store.dispatch(new AddNoteAction(newNote));

            this.dataService.updateBookNoteCount(this.book).then(book => {
              if (book) {
                this.store.dispatch(new UpdateBookAction(book));
              } else {
                this.logger.debug('error creating book');
              }
            });
          } else {
            this.logger.debug('error creating note');
          }
        });
      }
    });
  }

  deleteNote(note: Note): void {
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, { data: { name: note.name } });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed === true) {
        this.dataService.deleteNote(note).then(ok => {
          if (ok) {
            this.store.dispatch(new DeleteNoteAction(note.id));
          } else {
            this.logger.debug(`error deleting note [${note.id}]${note.name}`);
          }
        });
      }
    });
  }

  closeBook(): void {
    this.logger.debug(`closing book  [${this.book.id}] ${this.book.name}`);
    this.router.navigate(['books', this.book.id]);
  }

  async updateNote(note: Note) {
    this.isSaving = true;

    const ok = await this.dataService.updateNote(note);
    if (ok) {
      this.logger.debug(`note updated: [${note.id}] ${note.name}`);
      this.store.dispatch(new UpdateNoteAction(note));
      this.isSaving = false;
    } else {
      this.logger.debug(`failed to update note: [${note.id}] ${note.name}`);
    }
  }

  openNote(id: string) {
    if (this.book && this.book.id) {
      this.router.navigate(['notes', this.book.id, { noteId: id }]);
    } else {
      this.logger.error(`Failed to open note [${id}]. No book selected.`);
    }
  }

  private selectBook(book: Book): void {
    this.store.dispatch(new SelectBookAction(book));
  }

  private selectNote(id: string): void {
    this.store.dispatch(new SelectNoteAction(id));
  }

  filter(text: string) {
    this.noteFilter.next(text.toLowerCase());
  }

  async getAttachment(attachmentId: AttachmentId): Promise<Blob | Buffer> {
    return await this.dataService.getAttachment(attachmentId.note, attachmentId.attachmentId);
  }

  async deleteAttachment(attachmentId: AttachmentId) {
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      data: { name: attachmentId.attachmentId }
    });
    const confirmed = await dialogRef.afterClosed().toPromise();
    if (confirmed === true) {
      this.isSaving = true;
      const ok = await this.dataService.deleteAttachment(
        attachmentId.note,
        attachmentId.attachmentId
      );
      if (ok) {
        this.logger.debug(
          `Deleted attachment [${attachmentId.attachmentId}] from note [${attachmentId.note.name}].`
        );

        attachmentId.note.attachments = attachmentId.note.attachments.filter(
          _ => _.name !== attachmentId.attachmentId
        );
        this.store.dispatch(new UpdateNoteAction(attachmentId.note));
      }

      this.isSaving = false;
    }
  }

  async openAttachment(attachmentId: AttachmentId) {
    this.logger.debug(`Opening attachment [${attachmentId.attachmentId}].`);

    const blob = await this.getAttachment(attachmentId);
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, 'child');
  }

  async saveAttachment(attachmentId: AttachmentId) {
    this.logger.debug(`Saving attachment [${attachmentId.attachmentId}].`);

    const blob = await this.getAttachment(attachmentId);
    saveAs(<Blob>blob, attachmentId.attachmentId);
  }

  async attachmentAction(action: AttachmentAction) {
    switch (action.type) {
      case AttachmentActionType.DELETE: {
        await this.deleteAttachment(action.id);
        break;
      }
      case AttachmentActionType.OPEN: {
        await this.openAttachment(action.id);
        break;
      }
      case AttachmentActionType.SAVE: {
        await this.saveAttachment(action.id);
        break;
      }
    }
  }
}
