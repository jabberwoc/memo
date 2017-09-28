import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-books-page',
  templateUrl: './books-page.component.html',
  styleUrls: ['./books-page.component.css']
})
export class BooksPageComponent implements OnInit {

  pageTitle = 'books';

  constructor() { }

  ngOnInit() {
  }

}
