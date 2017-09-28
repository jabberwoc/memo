export class Note {
  id: string;
  name: string;
  book: string;
  content: string;
  date: string;

  constructor(id: string, name: string, book: string, content: string, date: string) {
    this.id = id;
    this.name = name;
    this.book = book;
    this.content = content;
    this.date = date;
  }
}
