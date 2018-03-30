import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreRoutingModule } from './core-routing.module';
import { NgxElectronModule } from 'ngx-electron';
import { NgxFsModule } from 'ngx-fs';
import { BooksModule } from '../books/books.module';
import { NotesModule } from '../notes/notes.module';
import { StoreModule } from '@ngrx/store';
import { LoginComponent } from './authentication/login/login.component';
import { SettingsComponent } from './settings/settings.component';
import { MenuComponent } from './menu/menu.component';
import { notes, selectedNoteId, books, selectedBook } from './data/store/memo-store';
import { DataService } from './data/data.service';
import { PouchDbService } from './data/pouch-db.service';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthGuard } from './authentication/guard/auth.guard';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { DeleteNoteComponent } from '../notes/dialog/delete-note/delete-note.component';
import { AddNoteComponent } from '../notes/dialog/add-note/add-note.component';
import { AddBookComponent } from '../books/dialog/add-book/add-book.component';
import { DeleteBookComponent } from '../books/dialog/delete-book/delete-book.component';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatButtonModule, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MenuService } from './menu/menu.service';
import './rxjs-operators';

@NgModule({
  imports: [
    CommonModule,
    CoreRoutingModule,
    NgxElectronModule,
    NgxFsModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    SharedModule,
    StoreModule.forRoot({ notes, selectedNoteId, books, selectedBook }),
    // TODO remove when entryComponents are moved (shared / core module or independent)
    BooksModule,
    NotesModule
  ],
  declarations: [LoginComponent, SettingsComponent, MenuComponent],
  exports: [RouterModule, MenuComponent],
  providers: [DataService, PouchDbService, AuthenticationService, AuthGuard, MenuService],
  entryComponents: [
    AddBookComponent,
    DeleteBookComponent,
    AddNoteComponent,
    DeleteNoteComponent,
    LoginComponent
  ]
})
export class CoreModule {}
