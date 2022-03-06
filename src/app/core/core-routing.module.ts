import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'books'
  },
  {
    path: 'books',
    loadChildren: () => import('../books/books.module').then(m => m.BooksModule)
  },
  {
    path: 'notes',
    loadChildren: () => import('../notes/notes.module').then(m => m.NotesModule)
  },
  {
    path: 'settings',
    component: SettingsComponent
  },
  {
    path: '**',
    redirectTo: 'books'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true } )],
  exports: [RouterModule]
})
export class CoreRoutingModule {}
