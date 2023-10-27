import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesRoutingModule } from './notes-routing.module';
import { NotesPageComponent } from './notes-page.component';
import { NotesListComponent } from './notes-list/notes-list.component';
import { EditorComponent } from './editor/editor.component';
// import { EditorModule } from '@tinymce/tinymce-angular';
import { MatDialogModule } from '@angular/material/dialog';
import { MomentModule } from 'ngx-moment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddNoteComponent } from './dialog/add-note/add-note.component';
import { TextPipe } from './pipe/text.pipe';
import { ConfirmDeleteComponent } from './dialog/confirm-delete/confirm-delete.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    NotesRoutingModule,
    MomentModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    SharedModule
  ],
  declarations: [
    NotesPageComponent,
    NotesListComponent,
    EditorComponent,
    AddNoteComponent,
    TextPipe,
    ConfirmDeleteComponent
  ],
  exports: [
    NotesPageComponent,
    NotesListComponent,
    EditorComponent,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class NotesModule { }
