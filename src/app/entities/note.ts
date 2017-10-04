export class Note {
  id: string;
  name: string;
  book: string;
  content: string;
  modified: string;

  constructor(id: string, name: string, book: string, content: string, modified: string) {
    this.id = id;
    this.name = name;
    this.book = book;
    this.content = content;
    this.modified = modified;
  }
}
