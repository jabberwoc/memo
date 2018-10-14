import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './settings/settings.component';
import { RoutingInterceptorService } from './routing/routing-interceptor.service';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [RoutingInterceptorService],
    children: []
  },
  {
    path: 'books',
    loadChildren: '../books/books.module#BooksModule'
  },
  {
    path: 'notes',
    loadChildren: '../notes/notes.module#NotesModule'
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
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class CoreRoutingModule {}
