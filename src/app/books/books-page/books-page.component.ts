import { Component, OnInit } from '@angular/core';
import { MdDialog } from '@angular/material';
import { DialogComponent } from './dialog/dialog.component';

@Component({
  selector: 'app-books-page',
  templateUrl: './books-page.component.html',
  styleUrls: ['./books-page.component.css']
})
export class BooksPageComponent implements OnInit {

  pageTitle = 'books';
  name: string;
  constructor(private dialog: MdDialog) { }

  addBook(): void {

    const dialogRef = this.dialog.open(DialogComponent, {
      // position: {top: '50%', left: '50%'},
      // height: '400px',
      // width: '600px'
      data: { name: this.name }
    });

    // TODO
    // smalltalk.prompt('New book', 'Enter name:', 'New notebook')
    // .then(function (name) {
    //     if (!name) {
    //         smalltalk.alert('Error', 'Name was empty!');
    //     }

    // TODO
    // return data.createNotebook(name).then(book => {
    //     if (book) {
    //         addNotebookListItem(book, true)
    //         selectNotebook(book.id)
    //     }
    // })

    // }).catch(err => console.log(err))
  }

  ngOnInit() {
  }

}
