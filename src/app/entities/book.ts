export class Book {
  id: string;
  name: string;
  book: string;
  content: string;
  count: number;

  constructor(id: string, name: string, book: string, content: string, count: number) {
    this.id = id;
    this.name = name;
    this.book = book;
    this.content = content;
    this.count = count;
  }
}
