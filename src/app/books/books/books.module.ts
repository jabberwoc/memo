import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BooksPageComponent } from '../books-page/books-page.component';
import { BooksListComponent } from '../books-page/books-list/books-list.component';
import { AddBookComponent } from '../books-page/dialog/add-book/add-book.component';
import { DeleteBookComponent } from '../books-page/dialog/delete-book/delete-book.component';
import { MdDialogModule, MdButtonModule, MdInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    MdDialogModule,
    MdButtonModule,
    MdInputModule,
    BrowserAnimationsModule,
    FormsModule,
  ],
  declarations: [
    BooksPageComponent,
    BooksListComponent,
    AddBookComponent,
    DeleteBookComponent,
  ],
  exports: [
    BooksPageComponent,
    BooksListComponent
  ]
})
export class BooksModule { }
