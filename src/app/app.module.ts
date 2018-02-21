import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CoreModule } from './core/core.module';

import { AppComponent } from './app.component';
import { AddBookComponent } from './books/dialog/add-book/add-book.component';
import { DeleteBookComponent } from './books/dialog/delete-book/delete-book.component';
import { AddNoteComponent } from './notes/dialog/add-note/add-note.component';
import { DeleteNoteComponent } from './notes/dialog/delete-note/delete-note.component';
import { NgxElectronModule } from 'ngx-electron';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BooksModule } from './books/books.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserAnimationsModule, CoreModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
