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
    if (a.modified > b.modified) { return -1; }
    if (a.modified < b.modified) { return 1; }
    return 0;
  }
}
