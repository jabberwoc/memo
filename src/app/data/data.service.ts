import { Injectable } from '@angular/core';
import { PouchDbService } from './pouch-db.service';
import { Book } from '../entities/book';
import * as cuid from 'cuid';
import docUri from 'docuri';


@Injectable()
export class DataService {

  noteUri = docUri.route('note/:book/(:note)');
  bookUri = docUri.route('book/(:book)');

  constructor(private pouchDbService: PouchDbService) { }

  getBooks(): Promise<Array<Book>> {
    const pattern = this.bookUri();
    return this.pouchDbService.all(pattern, pattern + '\uffff', true)
      .then(result => {
        return result.rows.map(row => new Book(row.doc.id, row.doc.name, row.doc.count));
      });
  }

  createBook(book: Book): Promise<boolean> {
    book.id = cuid();
    const id = this.bookUri({ book: book.id });
    return this.pouchDbService.put(id, { id: book.id, name: book.name, count: book.count });
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
}
