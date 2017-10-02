import { Component, OnInit } from '@angular/core';
import { MdDialog } from '@angular/material';
import { DialogComponent } from './dialog/dialog.component';
import { DataService } from '../../data/data.service';

@Component({
  selector: 'app-books-page',
  templateUrl: './books-page.component.html',
  styleUrls: ['./books-page.component.css']
})
export class BooksPageComponent implements OnInit {

  pageTitle = 'books';

  constructor(private dialog: MdDialog, private dataService: DataService) { }

  addBook(): void {

    const dialogRef = this.dialog.open(DialogComponent);

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result) {
        console.log('creating new book: ' + result);

        // TODO
        // return data.createNotebook(name).then(book => {
        //     if (book) {
        //         addNotebookListItem(book, true)
        //         selectNotebook(book.id)
        //     }
        // })


      }
    });
  }

  ngOnInit() {
  }

}
