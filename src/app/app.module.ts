import { NgModule } from '@angular/core';
import { CoreModule } from './core/core.module';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AddEditBookComponent } from './add-edit-book/add-edit-book.component';

@NgModule({
  declarations: [AppComponent, AddEditBookComponent],
  imports: [BrowserAnimationsModule, CoreModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
