import { NgModule } from '@angular/core';
import { CoreModule } from './core/core.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NotifierModule } from 'angular-notifier';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserAnimationsModule,
    CoreModule,
    NotifierModule.withConfig({
      position: { horizontal: { position: 'middle' }, vertical: { position: 'top' } }
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
