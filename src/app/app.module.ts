import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BooksPageComponent } from './books/books-page/books-page.component';
import { BooksListComponent } from './books/books-page/books-list/books-list.component';

@NgModule({
  declarations: [
    AppComponent,
    BooksPageComponent,
    BooksListComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
