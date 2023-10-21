import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BooksPageComponent } from './books-page.component';
import { BooksListComponent } from './books-list/books-list.component';
import { DeleteBookComponent } from './dialog/delete-book/delete-book.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { BooksRoutingModule } from './books-routing.module';
import { AddEditBookComponent } from './dialog/add-edit-book/add-edit-book.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, BooksRoutingModule],
  declarations: [BooksPageComponent, BooksListComponent, AddEditBookComponent, DeleteBookComponent],
  exports: [BooksPageComponent, BooksListComponent]
})
export class BooksModule { }
