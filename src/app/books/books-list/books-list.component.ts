import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { Book } from '../../core/data/model/entities/book';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-books-list',
  templateUrl: './books-list.component.html',
  styleUrls: ['./books-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BooksListComponent {
  @Input()
  books: Array<Book>;
  @Output()
  deleteRequest = new EventEmitter<Book>();
  @Output()
  editRequest = new EventEmitter<Book>();

  selectedBook: Book;

  constructor(private router: Router, private logger: NGXLogger) { }

  select(book: Book): void {
    this.selectedBook = book;
    this.open(book);
  }

  open(book: Book): void {
    this.logger.debug('opening book: ' + book.id + ', name: ' + book.name);
    this.router.navigate(['notes', book.id]);
  }

  deleteBook(book: Book) {
    this.deleteRequest.next(book);
  }

  editBook(book: Book) {
    this.editRequest.next(book);
  }
}
