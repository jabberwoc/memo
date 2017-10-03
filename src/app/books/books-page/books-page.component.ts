import { Component, OnInit } from '@angular/core';
import { MdDialog } from '@angular/material';
import { DialogComponent } from './dialog/dialog.component';
import { DataService } from '../../data/data.service';
import { Book } from '../../entities/book';

@Component({
  selector: 'app-books-page',
  templateUrl: './books-page.component.html',
  styleUrls: ['./books-page.component.css']
})
export class BooksPageComponent implements OnInit {

  pageTitle = 'books';

  books: Array<Book> = [];

  constructor(private dialog: MdDialog,
    private dataService: DataService) { }


  addBook(): void {

    const dialogRef = this.dialog.open(DialogComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name) {
        const newBook = new Book('', name, 0);
        this.dataService.createBook(newBook)
          .then(ok => {
            if (ok) {
              console.log('created new book: [' + newBook.id + '] ' + name);
              this.books.push(newBook);
            } else {
              console.log('error creating book: ' + ok);
            }
          });
      }
    });
  }

  loadBooks(): void {
    this.dataService.getBooks()
      .then(books => {
        this.books = books;
        console.log(books);
      });
  }

  deleteBook(book: Book): void {
    const index = this.books.indexOf(book);
    console.log('requested delete book: ' + book);

    // TODO dialog
    this.dataService.deleteBook(book)
      .then(ok => {
        if (ok) {
          console.log('book: [' + book.id + '] ' + book.name);
          this.books.splice(index, 1);
        } else {
          console.log('error deleting book: ' + ok);
        }
      });
  }

  ngOnInit() {
    // this.books.push(new Book('1', 'bla', 6));
    // this.books.push(new Book('2', 'blubb', 42));
    // this.books.push(new Book('3', 'hans', 7));
    // this.books.push(new Book('4', 'peter', 14));

    this.loadBooks();
  }

}
