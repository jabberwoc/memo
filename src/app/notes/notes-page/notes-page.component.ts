import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Book } from '../../entities/book';

@Component({
  selector: 'app-notes-page',
  templateUrl: './notes-page.component.html',
  styleUrls: ['./notes-page.component.css']
})
export class NotesPageComponent implements OnInit {

  book: Book;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(
      p => {
        // TODO load note
        this.book = new Book(p.bookId, p.bookName, 0);
        console.log('selected book: ' + this.book.id + ', name: ' + this.book.name);
      }
    );
  }

}
