import { Injectable } from '@angular/core';
import { PouchDbService } from './pouch-db.service';
import { Book } from '../entities/book';
import * as cuid from 'cuid';
import docUri from 'docuri';
import { ElectronService } from 'ngx-electron';
import { Note } from '../entities/note';


@Injectable()
export class DataService {

  noteUri = docUri.route('note/:book/(:note)');
  bookUri = docUri.route('book/(:book)');

  constructor(private electronService: ElectronService,
    private pouchDbService: PouchDbService) {
    this.setup();
  }

  setup(): void {
    // if (!this.electronService.isElectronApp) {

    //   const books = [
    //     new Book('1', 'bla', 6),
    //     new Book('2', 'blubb', 42),
    //     new Book('3', 'hans', 7),
    //     new Book('4', 'peter', 14)
    //   ];

    //   books.forEach(book => this.pouchDbService.put(this.bookUri({ book: book.id }),
    //     { id: book.id, name: book.name, count: book.count }));

    //   const notes = [
    //     new Note('note1', 'note 1', '1', 'sdsdsd', new Date().toJSON()),
    //     new Note('note2', 'note 2', '1', 'bla', new Date().toJSON()),
    //     new Note('note3', 'note 3', '1', 'blubb', new Date().toJSON()),
    //     new Note('note4', 'note 4', '1', '...', new Date().toJSON())
    //   ];

    //   notes.forEach(note => this.pouchDbService.put(this.noteUri({ book: '1', note: note.id }),
    //     { id: note.id, name: note.name, book: note.book, content: note.content, modified: note.modified }));

    // }
  }

  getBooks(): Promise<Array<Book>> {
    const pattern = this.bookUri();
    return this.pouchDbService.all(pattern, pattern + '\uffff', true)
      .then(result => {
        return result.rows.map(row => new Book(row.doc.id, row.doc.name, row.doc.count, row.doc.modified));
      });
  }

  getBook(id: string): Promise<Book> {
    return this.pouchDbService.get(this.bookUri({ book: id }))
      .then(book => {
        return new Book(book.id, book.name, book.count, book.modified);
      });
  }

  createBook(book: Book): Promise<boolean> {
    book.id = cuid();
    const id = this.bookUri({ book: book.id });
    book.modified = new Date().toJSON();
    return this.pouchDbService.put(id, { id: book.id, name: book.name, count: book.count, modified: book.modified });
  }

  deleteBook(book: Book): Promise<boolean> {
    const id = this.bookUri({ book: book.id });
    return this.pouchDbService.remove(id)
      .then(result => {
        if (result.ok) {
          // delete corresponding notes
          const pattern = this.noteUri({ book: this.bookUri(id).book });
          return this.pouchDbService.all(
            pattern,
            pattern + '\uffff',
            false
          ).then(notes => {
            return Promise.all(notes.rows.map(note => {
              return this.pouchDbService.remove(note.id);
            }));
          }).then(results => {
            return Promise.resolve(results.every(_ => _.ok));
          }).catch(err => {
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
    return this.pouchDbService.all(pattern, pattern + '\uffff', true)
      .then(result => {
        return result.rows.map(row => {
          const note = row.doc;
          return new Note(note.id, note.name, note.book, note.content, note.modified);
        });
      });
  }

  createNote(note: Note): Promise<boolean> {
    note.id = cuid();
    const id = this.noteUri({ book: note.book, note: note.id });
    note.modified = new Date().toJSON();
    return this.pouchDbService.put(id, { id: note.id, name: note.name, book: note.book, content: note.content, modified: note.modified });
  }

  updateNote(note: Note): Promise<boolean> {
    const id = this.noteUri({ book: note.book, note: note.id });
    note.modified = new Date().toJSON();
    return this.pouchDbService.put(id, { id: note.id, name: note.name, book: note.book, content: note.content, modified: note.modified });
  }

  updateBook(book: Book): Promise<boolean> {
    const id = this.bookUri({ book: book.id });
    book.modified = new Date().toJSON();
    return this.pouchDbService.put(id, { id: book.id, name: book.name, count: book.count, modified: book.modified });
  }
}
