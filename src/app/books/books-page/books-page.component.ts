import { Component, OnInit } from '@angular/core';
import { MdDialog } from '@angular/material';
import { DataService } from '../../data/data.service';
import { Book } from '../../entities/book';
import { AddBookComponent } from './dialog/add-book/add-book.component';
import { DeleteBookComponent } from './dialog/delete-book/delete-book.component';
import { Store } from '@ngrx/store';
import { MemoStore } from '../../store/memo-store';
import { Observable } from 'rxjs/Observable';
import { AddBookAction, AddBooksAction, DeleteBookAction } from '../../store/actions';

@Component({
  selector: 'app-books-page',
  templateUrl: './books-page.component.html',
  styleUrls: ['./books-page.component.css']
})
export class BooksPageComponent implements OnInit {

  pageTitle = 'books';

  books: Observable<Array<Book>>;

  constructor(private dialog: MdDialog,
    private dataService: DataService,
    private store: Store<MemoStore>) {
    this.books = this.store.select(_ => _.books);
  }


  addBook(): void {

    const dialogRef = this.dialog.open(AddBookComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name) {
        const newBook = new Book(null, name, 0, null);
        this.dataService.createBook(newBook)
          .then(ok => {
            if (ok) {
              console.log('created new book: [' + newBook.id + '] ' + name);
              this.store.dispatch(new AddBookAction(newBook));
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
        this.store.dispatch(new AddBooksAction(books));
      });
  }

  deleteBook(book: Book): void {
    console.log('requested delete book: ' + book);

    // confirm
    const dialogRef = this.dialog.open(DeleteBookComponent, { data: { name: book.name } });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.dataService.deleteBook(book)
          .then(ok => {
            if (ok) {
              console.log('book: [' + book.id + '] ' + book.name);
              this.store.dispatch(new DeleteBookAction(book.id));

            } else {
              console.log('error deleting book: ' + ok);
            }
          });
      }
    });
  }

  ngOnInit() {
    this.loadBooks();
  }

}
