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
}
