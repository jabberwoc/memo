import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Book } from '../../core/data/model/entities/book';
import { Router } from '@angular/router';

@Component({
  selector: 'app-books-list',
  templateUrl: './books-list.component.html',
  styleUrls: ['./books-list.component.css']
})
export class BooksListComponent {
  @Input()
  books: Array<Book>;
  @Output()
  deleteRequest = new EventEmitter<Book>();
  @Output()
  editRequest = new EventEmitter<Book>();

  selectedBook: Book;

  constructor(private router: Router) {}

  select(book: Book): void {
    this.selectedBook = book;
    console.log(this.selectedBook.name + ' selected.');
    this.open(book);
  }

  open(book: Book): void {
    console.log('opening book: ' + book.id + ', name: ' + book.name);
    this.router.navigate(['notes', book.id]);
  }

  deleteBook(book: Book) {
    this.deleteRequest.next(book);
  }

  editBook(book: Book) {
    this.editRequest.next(book);
  }
}
