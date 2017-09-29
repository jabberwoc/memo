import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { BooksPageComponent } from './books/books-page/books-page.component';
import { BooksListComponent } from './books/books-page/books-list/books-list.component';
import { NgxElectronModule } from 'ngx-electron';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from './app.routes';

@NgModule({
  declarations: [
    AppComponent,
    BooksPageComponent,
    BooksListComponent
  ],
  imports: [
    BrowserModule,
    NgxElectronModule,
    RouterModule.forRoot(APP_ROUTES)
    // NgbModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
