import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesPageComponent } from './notes-page/notes-page.component';
import { NotesListComponent } from './notes-page/notes-list/notes-list.component';
import { EditorComponent } from './notes-page/editor/editor.component';
import { MdDialogModule, MdButtonModule, MdInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MomentModule } from 'angular2-moment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddNoteComponent } from './notes-page/dialog/add-note/add-note.component';

@NgModule({
  imports: [
    CommonModule,
    MdDialogModule,
    MdButtonModule,
    MdInputModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MomentModule
  ],
  declarations: [
    NotesPageComponent,
    NotesListComponent,
    EditorComponent,
    AddNoteComponent
  ],
  exports: [
    NotesPageComponent,
    NotesListComponent,
    EditorComponent,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class NotesModule { }
