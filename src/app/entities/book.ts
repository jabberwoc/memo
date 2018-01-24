import { Note, NoteDto } from './note';

export class Book {
  id: string;
  name: string;
  count: number;
  modified: string;

  constructor(id: string, name: string, count: number, modified: string) {
    this.id = id;
    this.name = name;
    this.count = count;
    this.modified = modified;
  }

  public static modifiedComparer(a: Book, b: Book) {
    if (a.modified > b.modified) {
      return -1;
    }
    if (a.modified < b.modified) {
      return 1;
    }
    return 0;
  }
}

export class BookDto {
  name: string;
  count: number;
  modified: string;
  notes: Array<NoteDto>;

  constructor(book: Book, notes: Array<Note>) {
    this.name = book.name;
    this.count = book.count;
    this.modified = book.modified;
    this.notes = notes.map(n => new NoteDto(n.name, n.content, n.modified));
  }
}
