import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Book } from '../../../entities/book';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../../data/data.service';


@Component({
  selector: 'app-books-list',
  templateUrl: './books-list.component.html',
  styleUrls: ['./books-list.component.css']
})
export class BooksListComponent implements OnInit {

  @Input() books: Array<Book> = [];
  @Output() deleteRequest = new EventEmitter<Book>();

  selectedBook: Book;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService
  ) { }

  select(book: Book): void {
    this.selectedBook = book;
    console.log(this.selectedBook.name + ' selected.');
  }

  open(book: Book): void {
    // TODO
    console.log('opening book: ' + book);
    this.router.navigate(['notes', book.id, { name: book.name }]);
    // this.router.navigate(['books/', { bookId: book.id }]);
  }

  deleteBook(book: Book) {
    this.deleteRequest.next(book);
  }

  ngOnInit() {
    this.route.params.subscribe(
      p => {
        console.log(p);
        // this.id = p['id'];
        // this.showDetails = p['showDetails'];
        // this.load();
      }
    );
  }

}
