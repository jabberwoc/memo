import { Component, OnInit } from '@angular/core';
import { Book } from '../../../entities/book';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../../data/data.service';


@Component({
  selector: 'app-books-list',
  templateUrl: './books-list.component.html',
  styleUrls: ['./books-list.component.css']
})
export class BooksListComponent implements OnInit {

  books: Array<Book> = [];
  selectedBook: Book;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService
  ) {
    this.books.push(new Book('1', 'bla', 6));
    this.books.push(new Book('2', 'blubb', 42));
    this.books.push(new Book('3', 'hans', 7));
    this.books.push(new Book('4', 'peter', 14));
  }

  select(book: Book): void {
    this.selectedBook = book;
    console.log(this.selectedBook.name + ' selected.');
  }

  open(book: Book): void {
    // TODO
    console.log('opening book: ' + book);
    this.router.navigate(['notes', book.id, { bookName: book.name }]);
    // this.router.navigate(['books/', { bookId: book.id }]);
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
