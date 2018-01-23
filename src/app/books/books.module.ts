import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BooksPageComponent } from './books-page/books-page.component';
import { BooksListComponent } from './books-page/books-list/books-list.component';
import { AddBookComponent } from './books-page/dialog/add-book/add-book.component';
import { DeleteBookComponent } from './books-page/dialog/delete-book/delete-book.component';
import { MatDialogModule, MatButtonModule, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgxFsModule } from 'ngx-fs';

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    BrowserAnimationsModule,
    FormsModule,
    NgxFsModule
  ],
  declarations: [BooksPageComponent, BooksListComponent, AddBookComponent, DeleteBookComponent],
  exports: [BooksPageComponent, BooksListComponent]
})
export class BooksModule {}
