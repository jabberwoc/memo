import { Injectable } from '@angular/core';
import { PouchDbService } from './pouch-db.service';
import { Book } from './entities/book';
import * as cuid from 'cuid';
import docUri from 'docuri';
import { Note } from './entities/note';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { MemoStore } from './store/memo-store';
import { DeleteBookAction, DeleteNoteAction } from './store/actions';

@Injectable()
export class DataService {
  private noteUri = docUri.route('note/:book/(:note)');
  private bookUri = docUri.route('book/(:book)');
  syncPull: Observable<any>;

  constructor(private pouchDbService: PouchDbService, private store: Store<MemoStore>) {
    // sync changes wth state
    this.syncPull = this.pouchDbService.getChangeListener().pipe(
      filter(_ => _.direction === 'pull'),
      map(_ => this.formatChange(_.change)),
      filter(_ => _ !== false)
    );
  }

  private formatChange(change: any): any {
    if (!change.ok) {
      // TODO handle conflicts
      console.log('pull changes has errors');
      console.log(change.errors);
      return false;
    }

    const books = [];
    const notes = [];
    change.docs.forEach(doc => {
      if (doc._id.startsWith('book/')) {
        if (doc._deleted) {
          this.store.dispatch(new DeleteBookAction(this.bookUri(doc._id).book));
        } else {
          books.push(doc);
        }
      } else if (doc._id.startsWith('note/')) {
        if (doc._deleted) {
          this.store.dispatch(new DeleteNoteAction(this.noteUri(doc._id).note));
        } else {
          notes.push(doc);
        }
      }
    });

    return {
      books: books,
      notes: notes
    };
  }

  getBooks(): Promise<Array<Book>> {
    const pattern = this.bookUri();
    return this.pouchDbService.all(pattern, pattern + '\uffff', true).then(result => {
      return result.map(row => new Book(row.doc.id, row.doc.name, row.doc.count, row.doc.modified));
    });
  }

  getBook(id: string): Promise<Book> {
    return this.pouchDbService.get(this.bookUri({ book: id })).then(book => {
      return new Book(book.id, book.name, book.count, book.modified);
    });
  }

  createBook(book: Book): Promise<Book> {
    if (book.id == null) {
      book.id = cuid();
    }
    const id = this.bookUri({ book: book.id });
    book.modified = new Date().toJSON();
    return this.pouchDbService.put(id, book).then(ok => (ok ? book : null));
  }

  deleteBook(book: Book): Promise<boolean> {
    const id = this.bookUri({ book: book.id });
    return this.pouchDbService
      .remove(id)
      .then(result => {
        if (result.ok) {
          // delete corresponding notes
          const pattern = this.noteUri({ book: this.bookUri(id).book });
          return this.pouchDbService
            .all(pattern, pattern + '\uffff', false)
            .then(notes => Promise.all(notes.map(note => this.pouchDbService.remove(note.id))))
            .then(results => Promise.resolve(results.every(_ => _.ok)))
            .catch(err => {
              console.log(err);
              return false;
            });
        }
        return result.ok;
      })
      .catch(err => {
        console.log(err);
        return false;
      });
  }

  getNotes(bookId: string): Promise<Array<Note>> {
    const pattern = this.noteUri({ book: bookId });
    return this.pouchDbService.all(pattern, pattern + '\uffff', true).then(result => {
      return result.map(row => {
        const note = row.doc;
        return new Note(note.id, note.name, note.book, note.content, note.modified);
      });
    });
  }

  createNote(note: Note): Promise<Note> {
    if (note.id == null) {
      note.id = cuid();
    }
    const id = this.noteUri({ book: note.book, note: note.id });

    note.modified = new Date().toJSON();
    return this.pouchDbService.put(id, note).then(ok => {
      if (ok) {
        return this.getBook(note.book).then(book => {
          return this.updateBookNoteCount(book).then(
            _ => new Note(note.id, note.name, note.book, note.content, note.modified)
          );
        });
      }
    });
  }

  createNotes(notes: Array<Note>): Promise<Array<Note>> {
    return this.pouchDbService
      .bulkCreate(
        (<any>notes).map(n => {
          n.id = cuid();
          n._id = this.noteUri({ book: n.book, note: n.id });
          return n;
        })
      )
      .then(result => {
        return result.every(_ => _.ok) ? notes : null;
      });
  }

  updateNote(note: Note): Promise<boolean> {
    const id = this.noteUri({ book: note.book, note: note.id });
    note.modified = new Date().toJSON();
    return this.pouchDbService
      .put(id, {
        id: note.id,
        name: note.name,
        book: note.book,
        content: note.content,
        modified: note.modified
      })
      .then(response => (response ? true : false));
  }

  updateBook(book: Book): Promise<boolean> {
    const id = this.bookUri({ book: book.id });
    book.modified = new Date().toJSON();
    return this.pouchDbService.put(id, {
      id: book.id,
      name: book.name,
      count: book.count,
      modified: book.modified
    });
  }

  updateBookNoteCount(book: Book): Promise<Book> {
    // update note count
    return this.countNotes(book.id).then(count => {
      book.modified = new Date().toJSON();
      book.count = count;
      const bookId = this.bookUri({ book: book.id });
      return this.pouchDbService.put(bookId, book).then(ok => (ok ? book : null));
    });
  }

  deleteNote(note: Note): Promise<boolean> {
    const id = this.noteUri({ note: note.id, book: note.book });
    return this.pouchDbService
      .remove(id)
      .then(result => {
        if (result.ok) {
          return this.getBook(note.book).then(book =>
            this.updateBookNoteCount(book).then(updated => Boolean(updated))
          );
        }

        return result.ok;
      })
      .catch(err => {
        console.log(err);
        return false;
      });
  }

  countNotes(bookId: string): Promise<number> {
    const pattern = this.noteUri({ book: bookId });
    return this.pouchDbService.all(pattern, pattern + '\uffff', true).then(result => {
      return result.length;
    });
  }
}
