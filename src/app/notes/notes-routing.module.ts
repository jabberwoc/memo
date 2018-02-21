import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NotesPageComponent } from './notes-page.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'books',
    pathMatch: 'full'
  },
  // {
  //   path: 'books',
  //   component: BooksPageComponent
  // },
  // {
  //   path: 'books/:id',
  //   component: BooksPageComponent
  // },
  {
    path: ':bookId',
    component: NotesPageComponent
  },
  {
    // TODO implement
    path: ':bookId/:noteId',
    component: NotesPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotesRoutingModule {}
