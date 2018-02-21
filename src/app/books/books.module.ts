import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BooksPageComponent } from './books-page.component';
import { BooksListComponent } from './books-list/books-list.component';
import { AddBookComponent } from './dialog/add-book/add-book.component';
import { DeleteBookComponent } from './dialog/delete-book/delete-book.component';
import { MatDialogModule, MatButtonModule, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgxFsModule } from 'ngx-fs';
import { BooksRoutingModule } from './books-routing.module';
import { NotesRoutingModule } from '../notes/notes-routing.module';
import { NotesModule } from '../notes/notes.module';
import { CoreModule } from '../core/core.module';

@NgModule({
  imports: [
    CommonModule,
    // CoreModule,
    BooksRoutingModule
    // MatDialogModule,
    // MatButtonModule,
    // MatInputModule,
    // BrowserAnimationsModule,
    // FormsModule
  ],
  declarations: [BooksPageComponent, BooksListComponent, AddBookComponent, DeleteBookComponent],
  exports: [BooksPageComponent, BooksListComponent]
})
export class BooksModule {}
