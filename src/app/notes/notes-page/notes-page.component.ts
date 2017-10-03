import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Book } from '../../entities/book';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-notes-page',
  templateUrl: './notes-page.component.html',
  styleUrls: ['./notes-page.component.css']
})
export class NotesPageComponent implements OnInit {

  book: Book;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params => {
      console.log('params: + ' + params);
      this.book = new Book(params.get('bookId'), params.get('name'), 0);
      console.log('selected book: ' + this.book.id + ', name: ' + this.book.name);
    }));

    // this.route.params.subscribe(
    //   p => {
    //     // TODO load note
    //     this.book = new Book(p.id, p.name, 0);
    //     console.log('selected book: ' + this.book.id + ', name: ' + this.book.name);
    //   }
    // );
  }

}
