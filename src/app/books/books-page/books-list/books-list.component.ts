import { Component, OnInit } from '@angular/core';
import { Book } from '../../../entities/book';

@Component({
  selector: 'app-books-list',
  templateUrl: './books-list.component.html',
  styleUrls: ['./books-list.component.css']
})
export class BooksListComponent implements OnInit {

  books: Array<Book> = [];
  selectedBook: Book;

  constructor() {
    this.books.push(new Book('bla', 'bla', 6));
    this.books.push(new Book('blubb', 'blubb', 42));
    this.books.push(new Book('hans', 'hans', 7));
    this.books.push(new Book('peter', 'peter', 14));
  }

  select(book: Book): void {
    this.selectedBook = book;
    console.log(this.selectedBook.name + ' selected.');
  }

  ngOnInit() {
  }

}
