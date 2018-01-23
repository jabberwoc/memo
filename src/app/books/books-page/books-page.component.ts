import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DataService } from '../../data/data.service';
import { Book } from '../../entities/book';
import { AddBookComponent } from './dialog/add-book/add-book.component';
import { DeleteBookComponent } from './dialog/delete-book/delete-book.component';
import { Store } from '@ngrx/store';
import { MemoStore } from '../../store/memo-store';
import { Observable } from 'rxjs/Observable';
import { AddBookAction, AddBooksAction, DeleteBookAction } from '../../store/actions';
import { Router } from '@angular/router';
import { LoginComponent } from '../../login/login.component';
import { ElectronService } from 'ngx-electron';
import { FsService } from 'ngx-fs';

@Component({
  selector: 'app-books-page',
  templateUrl: './books-page.component.html',
  styleUrls: ['./books-page.component.css']
})
export class BooksPageComponent implements OnInit {
  pageTitle = 'books';

  books: Observable<Array<Book>>;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private dataService: DataService,
    private store: Store<MemoStore>,
    private electronService: ElectronService,
    private fsService: FsService
  ) {
    this.books = this.store.select(_ => _.books).map(_ => _.sort(Book.modifiedComparer));
  }

  addBook(): void {
    const dialogRef = this.dialog.open(AddBookComponent);

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

  loadBooks(): void {
    this.dataService.getBooks().then(books => {
      this.store.dispatch(new AddBooksAction(books));
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

  login(): void {
    const dialogRef = this.dialog.open(LoginComponent);

    // dialogRef.afterClosed().subscribe(() => {
    //   // TODO ?
    // });
  }

  ngOnInit() {
    this.loadBooks();
  }

  openSettings(): void {
    this.router.navigate(['settings']);
  }

  export(): void {
    this.dataService.getBooks().then(books => {
      Promise.all(books.map(book => this.dataService.getNotes(book.id))).then(result => {
        const notes = Array.prototype.concat(...result);
        const jsonExport = JSON.stringify({ books: books, notes: notes });
        console.log(jsonExport);

        const savePath = this.electronService.remote.dialog.showSaveDialog({
          title: 'Export data',
          defaultPath: 'memo-export.json'
        });

        console.log(savePath);

        // const remote = require('electron').remote;
        // const electronFs = remote.require('fs');

        (<any>this.fsService.fs).writeFile(savePath, jsonExport, err => {
          if (err) {
            return console.log('error exporting memo data: ' + err);
          }

          console.log('memo data exported successfully.');
        });
      });
    });
  }
}
