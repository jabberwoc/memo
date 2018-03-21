import { Action } from '@ngrx/store';
import { Note } from '../entities/note';
import { Book } from '../entities/book';

// note actions
export const ADD_NOTES = 'ADD_NOTES';
export const ADD_NOTE = 'ADD_NOTE';
export const UPDATE_NOTE = 'UPDATE_NOTE';
export const ADD_OR_UPDATE_NOTE = 'ADD_OR_UPDATE_NOTE';
export const DELETE_NOTE = 'DELETE_NOTE';
export const SELECT_NOTE = 'SELECT_NOTE';

// book actions
export const ADD_BOOKS = 'ADD_BOOKS';
export const ADD_BOOK = 'ADD_BOOK';
export const UPDATE_BOOK = 'UPDATE_BOOK';
export const ADD_OR_UPDATE_BOOK = 'ADD_OR_UPDATE_BOOK';
export const DELETE_BOOK = 'DELETE_BOOK';

export class AddNotesAction implements Action {
  readonly type = ADD_NOTES;
  constructor(public payload: Note[]) {}
}

export class AddNoteAction implements Action {
  readonly type = ADD_NOTE;
  constructor(public payload: Note) {}
}

export class UpdateNoteAction implements Action {
  readonly type = UPDATE_NOTE;
  constructor(public payload: Note) {}
}

export class AddOrUpdateNoteAction implements Action {
  readonly type = ADD_OR_UPDATE_NOTE;
  constructor(public payload: Note) {}
}

export class DeleteNoteAction implements Action {
  readonly type = DELETE_NOTE;
  constructor(public payload: string) {}
}

export class SelectNoteAction implements Action {
  readonly type = SELECT_NOTE;
  constructor(public payload: string) {}
}

export class AddBooksAction implements Action {
  readonly type = ADD_BOOKS;
  constructor(public payload: Book[]) {}
}

export class AddBookAction implements Action {
  readonly type = ADD_BOOK;
  constructor(public payload: Book) {}
}

export class UpdateBookAction implements Action {
  readonly type = UPDATE_BOOK;
  constructor(public payload: Book) {}
}

export class AddOrUpdateBookAction implements Action {
  readonly type = ADD_OR_UPDATE_BOOK;
  constructor(public payload: Book) {}
}

export class DeleteBookAction implements Action {
  readonly type = DELETE_BOOK;
  constructor(public payload: string) {}
}

export type NoteActions =
  | AddNotesAction
  | AddNoteAction
  | UpdateNoteAction
  | AddOrUpdateNoteAction
  | DeleteNoteAction;
export type SelectNoteActions = SelectNoteAction | DeleteNoteAction;
export type BookActions =
  | AddBooksAction
  | AddBookAction
  | UpdateBookAction
  | AddOrUpdateBookAction
  | DeleteBookAction;
