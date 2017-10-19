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

  public static modifiedComparer(a: Note, b: Note) {
    if (a.modified > b.modified) { return -1; }
    if (a.modified < b.modified) { return 1; }
    return 0;
  }
}
