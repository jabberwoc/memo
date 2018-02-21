import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Book } from '../../core/data/entities/book';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../core/data/data.service';

@Component({
  selector: 'app-books-list',
  templateUrl: './books-list.component.html',
  styleUrls: ['./books-list.component.css']
})
export class BooksListComponent implements OnInit {
  @Input() books: Array<Book>;
  @Output() deleteRequest = new EventEmitter<Book>();

  selectedBook: Book;

  constructor(private router: Router, private dataService: DataService) {}

  select(book: Book): void {
    this.selectedBook = book;
    console.log(this.selectedBook.name + ' selected.');
    this.open(book);
  }

  open(book: Book): void {
    // TODO
    console.log('opening book: ' + book.id + ', name: ' + book.name);
    this.router.navigate(['notes', book.id]);
  }

  deleteBook(book: Book) {
    this.deleteRequest.next(book);
  }

  ngOnInit() {}
}
