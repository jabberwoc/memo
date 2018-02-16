import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesPageComponent } from './notes-page/notes-page.component';
import { NotesListComponent } from './notes-page/notes-list/notes-list.component';
import { EditorComponent } from './notes-page/editor/editor.component';
import { MatDialogModule, MatButtonModule, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MomentModule } from 'angular2-moment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddNoteComponent } from './notes-page/dialog/add-note/add-note.component';
import { TextPipe } from './notes-page/pipe/text.pipe';
import { DeleteNoteComponent } from './notes-page/dialog/delete-note/delete-note.component';
import { BusyModule } from '../busy/busy.module';

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MomentModule,
    BusyModule
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
