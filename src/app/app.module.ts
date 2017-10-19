import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { AngularFontAwesomeModule } from 'angular-font-awesome/angular-font-awesome';

import { AppComponent } from './app.component';
// import { BooksPageComponent } from './books/books-page/books-page.component';
// import { BooksListComponent } from './books/books-page/books-list/books-list.component';
import { NgxElectronModule } from 'ngx-electron';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from './app.routes';
// import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { DataService } from './data/data.service';
import { NotesPageComponent } from './notes/notes-page/notes-page.component';
import { NotesListComponent } from './notes/notes-page/notes-list/notes-list.component';
import { PouchDbService } from './data/pouch-db.service';
import { MdDialogModule, MdButtonModule, MdInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddBookComponent } from './books/books-page/dialog/add-book/add-book.component';
import { DeleteBookComponent } from './books/books-page/dialog/delete-book/delete-book.component';
import { AddNoteComponent } from './notes/notes-page/dialog/add-note/add-note.component';
import { MomentModule } from 'angular2-moment';
import { EditorComponent } from './notes/notes-page/editor/editor.component';

import { StoreModule } from '@ngrx/store';
import { notes, selectedNoteId, books } from './store/memo-store';
import { BooksModule } from './books/books.module';
import { NotesModule } from './notes/notes.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxElectronModule,
    RouterModule.forRoot(APP_ROUTES, { useHash: true }),
    BooksModule,
    NotesModule,
    // AngularFontAwesomeModule
    // NgbModule.forRoot()
    StoreModule.forRoot({ notes, selectedNoteId, books }),
  ],
  entryComponents: [
    AddBookComponent,
    DeleteBookComponent,
    AddNoteComponent
  ],
  providers: [
    DataService, PouchDbService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
