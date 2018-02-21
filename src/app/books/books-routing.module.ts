import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BooksPageComponent } from './books-page.component';
import { NotesPageComponent } from '../notes/notes-page.component';

const routes: Routes = [
  {
    path: '',
    component: BooksPageComponent
  },
  // {
  //   path: 'books',
  //   component: BooksPageComponent
  // },
  {
    path: ':id',
    component: BooksPageComponent
  }
  // {
  //   path: 'notes/:bookId',
  //   loadChildren: '../notes/notes.module#NotesModule'
  // }
  // {
  //   path: 'notes/:bookId/:noteId/:noteName',
  //   component: NotesPageComponent
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BooksRoutingModule {}
