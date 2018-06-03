import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BooksPageComponent } from './books-page.component';
import { BooksListComponent } from './books-list/books-list.component';
import { AddBookComponent } from './dialog/add-book/add-book.component';
import { DeleteBookComponent } from './dialog/delete-book/delete-book.component';
import { MatDialogModule } from '@angular/material';
import { BooksRoutingModule } from './books-routing.module';

@NgModule({
  imports: [CommonModule, MatDialogModule, BooksRoutingModule],
  declarations: [BooksPageComponent, BooksListComponent, AddBookComponent, DeleteBookComponent],
  exports: [BooksPageComponent, BooksListComponent],
  entryComponents: [AddBookComponent, DeleteBookComponent]
})
export class BooksModule {}
