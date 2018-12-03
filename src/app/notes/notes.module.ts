import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesRoutingModule } from './notes-routing.module';
import { NotesPageComponent } from './notes-page.component';
import { NotesListComponent } from './notes-list/notes-list.component';
import { EditorComponent } from './editor/editor.component';
import { MatDialogModule } from '@angular/material';
import { MomentModule } from 'ngx-moment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddNoteComponent } from './dialog/add-note/add-note.component';
import { TextPipe } from './pipe/text.pipe';
import { DeleteNoteComponent } from './dialog/delete-note/delete-note.component';
import { FileHelpersModule } from 'ngx-file-helpers';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    NotesRoutingModule,
    MomentModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FileHelpersModule,
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
  ],
  entryComponents: [AddNoteComponent, DeleteNoteComponent]
})
export class NotesModule {}
