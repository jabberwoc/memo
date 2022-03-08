import { Injectable } from '@angular/core';
import { PouchDbService } from './pouch-db.service';
import { Book } from './model/entities/book';
import cuid from 'cuid';
import docUri from 'docuri';
import { Note } from './model/entities/note';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { MemoStore } from './store/memo-store';
import { DeleteBookAction, DeleteNoteAction } from './store/actions';
import { Attachment } from './model/entities/attachment';

@Injectable()
export class DataService {
  private noteUri = docUri.route('note/:book/(:note)');
  private bookUri = docUri.route('book/(:book)');
  syncPull: Observable<any>;
  reset: Observable<void>;

  constructor(private pouchDbService: PouchDbService, private store: Store<MemoStore>) {
    // sync changes wth state
    this.syncPull = this.pouchDbService.onChange.pipe(
      filter(_ => _.direction === 'pull'),
      map(_ => this.formatChange(_.change)),
      filter(_ => _ !== false)
    );
    this.reset = this.pouchDbService.onDatabaseReset;
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

  async getBooks(): Promise<Array<Book>> {
    const pattern = this.bookUri();
    const result = await this.pouchDbService.all(pattern, pattern + '\uffff', true);
    return result.map(row => new Book(row.doc.id, row.doc.name, row.doc.count, row.doc.modified));
  }

  async getBook(id: string): Promise<Book> {
    const book = await this.pouchDbService.get(this.bookUri({ book: id }));
    return new Book(book.id, book.name, book.count, book.modified);
  }

  async createBook(book: Book): Promise<Book> {
    if (book.id == null) {
      book.id = cuid();
    }
    const id = this.bookUri({ book: book.id });
    book.modified = new Date().toJSON();
    const ok = await this.pouchDbService.put(id, book);
    return ok ? book : null;
  }

  async deleteBook(book: Book): Promise<boolean> {
    const id = this.bookUri({ book: book.id });
    try {
      const result = await this.pouchDbService.remove(id);
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
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async getNotes(bookId: string): Promise<Array<Note>> {
    const pattern = this.noteUri({ book: bookId });
    const result = await this.pouchDbService.all(pattern, pattern + '\uffff', true);
    return result.map(row => {
      const doc = row.doc;
      const note = new Note(doc.id, doc.name, doc.book, doc.content, doc.modified);
      if (!doc._attachments) {
        return note;
      }

      const attachments = Object.keys(doc._attachments).map(a => {
        const metadata = doc._attachments[a];
        return new Attachment({
          name: a,
          stub: true,
          type: metadata.content_type,
          size: metadata.length,
          digest: metadata.digest
        });
      });
      note.attachments.push(...attachments);
      return note;
    });
  }

  async createNote(note: Note): Promise<Note> {
    if (note.id == null) {
      note.id = cuid();
    }
    const id = this.noteUri({ book: note.book, note: note.id });

    note.modified = new Date().toJSON();
    const ok = await this.pouchDbService.put(id, note);
    if (ok) {
      return this.getBook(note.book).then(async book => {
        await this.updateBookNoteCount(book);
        return new Note(note.id, note.name, note.book, note.content, note.modified);
      });
    }
  }

  async createNotes(notes: Array<Note>): Promise<Array<Note>> {
    try {
      const result = await this.pouchDbService.bulkCreate(
        (<any>notes).map(n => {
          n.id = cuid();
          n._id = this.noteUri({ book: n.book, note: n.id });
          return n;
        })
      );
      return notes;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async updateNote(note: Note): Promise<boolean> {
    const id = this.noteUri({ book: note.book, note: note.id });
    note.modified = new Date().toJSON();
    const attachments = note.attachments.reduce((result, item) => {
      result[item.name] = {
        stub: item.stub,
        digest: item.digest,
        content_type: item.type,
        data: item.data
      };
      return result;
    }, {});
    const doc = {
      id: note.id,
      name: note.name,
      book: note.book,
      content: note.content,
      modified: note.modified,
      _attachments: attachments
    };
    try {
      const response = await this.pouchDbService.put(id, doc);
      return response ? true : false;
    } catch (err) {
      console.log(err);
      Promise.reject();
    }
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

  async updateBookNoteCount(book: Book): Promise<Book> {
    // update note count
    const count = await this.countNotes(book.id);
    book.modified = new Date().toJSON();
    book.count = count;
    const ok = await this.pouchDbService.put(this.bookUri({ book: book.id }), book);
    return ok ? book : null;
  }

  async deleteNote(note: Note): Promise<boolean> {
    const id = this.noteUri({ note: note.id, book: note.book });
    try {
      const result = await this.pouchDbService.remove(id);
      if (result.ok) {
        return this.getBook(note.book).then(book =>
          this.updateBookNoteCount(book).then(updated => Boolean(updated))
        );
      }
      return result.ok;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async countNotes(bookId: string): Promise<number> {
    const pattern = this.noteUri({ book: bookId });
    const result = await this.pouchDbService.all(pattern, pattern + '\uffff', true);
    return result.length;
  }

  async getAttachment(note: Note, attachment: string): Promise<Blob | Buffer> {
    const docId = this.noteUri({ note: note.id, book: note.book });
    return this.pouchDbService.getAttachment(docId, attachment).catch(err => {
      console.log(err);
      return Promise.reject();
    });
  }

  public async deleteAttachment(note: Note, attachmentId: string): Promise<boolean> {
    try {
      const docId = this.noteUri({ note: note.id, book: note.book });
      const result = await this.pouchDbService.removeAttachment(docId, attachmentId);
      return result.ok;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
