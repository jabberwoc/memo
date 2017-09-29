import { Routes } from '@angular/router';
import { BooksPageComponent } from './books/books-page/books-page.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'books/',
    pathMatch: 'full'
  },
  {
    path: 'books/:bookId?',
    component: BooksPageComponent
  },
  // {
  //   path: 'note/:bookId/:noteId?',
  //   component: NotesPageComponent
  // },
  // {
  //   path: '**',
  //   component: ErrorComponent
  // }
];

