import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { BooksPageComponent } from './books/books-page/books-page.component';
import { BooksListComponent } from './books/books-page/books-list/books-list.component';
import { NgxElectronModule } from 'ngx-electron';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from './app.routes';
import { DataService } from './data/data.service';
import { NotesPageComponent } from './notes/notes-page/notes-page.component';
import { NotesListComponent } from './notes/notes-page/notes-list/notes-list.component';

@NgModule({
  declarations: [
    AppComponent,
    BooksPageComponent,
    BooksListComponent,
    NotesPageComponent,
    NotesListComponent
  ],
  imports: [
    BrowserModule,
    NgxElectronModule,
    RouterModule.forRoot(APP_ROUTES)
    // NgbModule.forRoot()
  ],
  providers: [
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
