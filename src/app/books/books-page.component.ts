import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DataService } from '../core/data/data.service';
import { Book } from '../core/data/entities/book';
import { DeleteBookComponent } from './dialog/delete-book/delete-book.component';
import { Store } from '@ngrx/store';
import { MemoStore } from '../core/data/store/memo-store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AddBookAction,
  SetBooksAction,
  DeleteBookAction,
  AddOrUpdateBookAction,
  UpdateBookAction
} from '../core/data/store/actions';
import { MenuService, MenuName } from '../core/menu/menu.service';
import { AddEditBookComponent } from './dialog/add-edit-book/add-edit-book.component';
import { DialogMode } from './dialog/add-edit-book/dialog-mode';

@Component({
  selector: 'app-books-page',
  templateUrl: './books-page.component.html',
  styleUrls: ['./books-page.component.css']
})
export class BooksPageComponent implements OnInit {
  pageTitle = 'Books';

  books: Observable<Array<Book>>;

  constructor(
    private dialog: MatDialog,
    private dataService: DataService,
    private menuService: MenuService,
    private store: Store<MemoStore>
  ) {
    this.books = this.store.select(_ => _.books).pipe(map(_ => _.sort(Book.modifiedComparer)));
    this.menuService.registerMenuAction(MenuName.BOOKS, () => this.addBook());

    this.dataService.syncPull.subscribe(change => this.updateState(change));
  }

  updateState(change: any): void {
    change.books.forEach(_ => this.store.dispatch(new AddOrUpdateBookAction(_)));
  }

  addBook(): void {
    const dialogRef = this.dialog.open(AddEditBookComponent, {
      data: { mode: DialogMode.ADD }
    });

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name) {
        const newBook = new Book(null, name, 0, null);
        this.dataService.createBook(newBook).then(ok => {
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

  editBook(book: Book): void {
    const dialogRef = this.dialog.open(AddEditBookComponent, {
      data: { mode: DialogMode.EDIT, name: book.name }
    });

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name !== book.name) {
        book.name = name;
        this.updateBook(book);
      }
    });
  }

  updateBook(book: Book) {
    this.dataService.updateBook(book).then(ok => {
      if (ok) {
        console.log('book updated: [' + book.id + '] ' + book.name);
        this.store.dispatch(new UpdateBookAction(book));
      } else {
        console.log('error updating book: ' + ok);
      }
    });
  }

  loadBooks(): void {
    this.dataService.getBooks().then(books => {
      this.store.dispatch(new SetBooksAction(books));
    });
  }

  deleteBook(book: Book): void {
    console.log('requested delete book: ' + book);

    // confirm
    const dialogRef = this.dialog.open(DeleteBookComponent, { data: { name: book.name } });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.dataService.deleteBook(book).then(ok => {
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
