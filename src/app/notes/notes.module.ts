import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesRoutingModule } from './notes-routing.module';
import { NotesPageComponent } from './notes-page.component';
import { NotesListComponent } from './notes-list/notes-list.component';
import { EditorComponent } from './editor/editor.component';
import { MatDialogModule, MatButtonModule, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MomentModule } from 'angular2-moment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddNoteComponent } from './dialog/add-note/add-note.component';
import { TextPipe } from './pipe/text.pipe';
import { DeleteNoteComponent } from './dialog/delete-note/delete-note.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    NotesRoutingModule,
    MomentModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    NotesPageComponent,
    NotesListComponent,
    EditorComponent,
    AddNoteComponent,
    TextPipe,
    DeleteNoteComponent
  ],
  exports: [
    NotesPageComponent,
    NotesListComponent,
    EditorComponent,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class NotesModule {}
