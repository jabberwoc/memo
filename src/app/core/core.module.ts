import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreRoutingModule } from './core-routing.module';
import { NgxElectronModule } from 'ngx-electron';
import { NgxFsModule } from 'ngx-fs';
import { StoreModule } from '@ngrx/store';
import { LoginComponent } from './authentication/login/login.component';
import { SettingsComponent } from './settings/settings.component';
import { MenuComponent } from './menu/menu.component';
import { notes, selectedNoteId, books, selectedBook } from './data/store/memo-store';
import { DataService } from './data/data.service';
import { PouchDbService } from './data/pouch-db.service';
import { AuthenticationService } from './authentication/authentication.service';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatButtonModule, MatInputModule } from '@angular/material';
import { MenuService } from './menu/menu.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    CoreRoutingModule,
    NgxElectronModule,
    NgxFsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    SharedModule,
    StoreModule.forRoot({ notes, selectedNoteId, books, selectedBook })
  ],
  declarations: [LoginComponent, SettingsComponent, MenuComponent],
  exports: [RouterModule, MenuComponent],
  providers: [DataService, PouchDbService, AuthenticationService, MenuService],
  entryComponents: [LoginComponent]
})
export class CoreModule {}
