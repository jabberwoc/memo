import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { SettingsComponent } from './settings/settings.component';
import { BooksPageComponent } from '../books/books-page.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'books',
    pathMatch: 'full'
  },
  {
    path: 'books',
    // component: BooksPageComponent,
    loadChildren: '../books/books.module#BooksModule'
  },
  {
    path: 'notes',
    // path: 'notes/:bookId',
    // path: 'notes/:bookId/:noteId/:noteName',
    // component: NotesPageComponent
    loadChildren: '../notes/notes.module#NotesModule'
  },
  {
    path: 'settings',
    component: SettingsComponent
  },
  {
    // TODO 404
    path: '**',
    redirectTo: 'books'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class CoreRoutingModule {}