import { Routes } from '@angular/router';
import { BooksPageComponent } from './books/books-page/books-page.component';
import { NotesPageComponent } from './notes/notes-page/notes-page.component';
import { AuthGuard } from './guard/auth.guard';
import { LoginComponent } from './login/login.component';

export const APP_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    redirectTo: 'books',
    pathMatch: 'full'
  },
  {
    path: 'books',
    component: BooksPageComponent
  },
  {
    path: 'books/:id',
    component: BooksPageComponent
  },
  {
    path: 'notes/:bookId',
    component: NotesPageComponent
  },
  {
    path: 'notes/:bookId/:noteId/:noteName',
    component: NotesPageComponent
  },
  {
    path: '**',
    redirectTo: 'books'
  }
];
