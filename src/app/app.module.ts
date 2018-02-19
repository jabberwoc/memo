import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { AngularFontAwesomeModule } from 'angular-font-awesome/angular-font-awesome';

import { AppComponent } from './app.component';
import { NgxElectronModule } from 'ngx-electron';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from './app.routes';
// import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { DataService } from './data/data.service';
import { NotesPageComponent } from './notes/notes-page/notes-page.component';
import { NotesListComponent } from './notes/notes-page/notes-list/notes-list.component';
import { PouchDbService } from './data/pouch-db.service';
import { MatDialogModule, MatButtonModule, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddBookComponent } from './books/books-page/dialog/add-book/add-book.component';
import { DeleteBookComponent } from './books/books-page/dialog/delete-book/delete-book.component';
import { AddNoteComponent } from './notes/notes-page/dialog/add-note/add-note.component';
import { MomentModule } from 'angular2-moment';
import { EditorComponent } from './notes/notes-page/editor/editor.component';

// import { ModalModule } from 'ngx-modialog';

import { StoreModule } from '@ngrx/store';
import { notes, selectedNoteId, books } from './store/memo-store';
import { BooksModule } from './books/books.module';
import { NotesModule } from './notes/notes.module';
import { DeleteNoteComponent } from './notes/notes-page/dialog/delete-note/delete-note.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './authentication/guard/auth.guard';
import { SettingsComponent } from './settings/settings.component';
import { AuthenticationService } from './authentication/authentication.service';
import { NgxFsModule } from 'ngx-fs';
import { BusyModule } from './busy/busy.module';
import { MenuComponent } from './menu/menu.component';

@NgModule({
  declarations: [AppComponent, LoginComponent, SettingsComponent, MenuComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgxElectronModule,
    NgxFsModule,
    RouterModule.forRoot(APP_ROUTES, { useHash: true }),
    BooksModule,
    NotesModule,
    BusyModule,
    // AngularFontAwesomeModule
    // NgbModule.forRoot()
    // ModalModule.forRoot(),
    StoreModule.forRoot({ notes, selectedNoteId, books })
  ],
  entryComponents: [AddBookComponent, DeleteBookComponent, AddNoteComponent, DeleteNoteComponent],
  providers: [DataService, PouchDbService, AuthenticationService, AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule {}
