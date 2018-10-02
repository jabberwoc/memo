import { Action } from '@ngrx/store';
import { Note } from '../model/entities/note';
import { Book } from '../model/entities/book';

// note actions
export const SET_NOTES = 'SET_NOTES';
export const ADD_NOTE = 'ADD_NOTE';
export const UPDATE_NOTE = 'UPDATE_NOTE';
export const ADD_OR_UPDATE_NOTE = 'ADD_OR_UPDATE_NOTE';
export const DELETE_NOTE = 'DELETE_NOTE';
export const SELECT_NOTE = 'SELECT_NOTE';

// book actions
export const SET_BOOKS = 'SET_BOOKS';
export const ADD_BOOK = 'ADD_BOOK';
export const UPDATE_BOOK = 'UPDATE_BOOK';
export const ADD_OR_UPDATE_BOOK = 'ADD_OR_UPDATE_BOOK';
export const DELETE_BOOK = 'DELETE_BOOK';
export const SELECT_BOOK = 'SELECT_BOOK';

export class SetNotesAction implements Action {
  readonly type = SET_NOTES;
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

export class SelectBookAction implements Action {
  readonly type = SELECT_BOOK;
  constructor(public payload: Book) {}
}

export class SetBooksAction implements Action {
  readonly type = SET_BOOKS;
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
  | SetNotesAction
  | AddNoteAction
  | UpdateNoteAction
  | AddOrUpdateNoteAction
  | DeleteNoteAction;
export type SelectNoteActions = SelectNoteAction | DeleteNoteAction;
export type BookActions =
  | SetBooksAction
  | AddBookAction
  | UpdateBookAction
  | AddOrUpdateBookAction
  | DeleteBookAction;
export type SelectBookActions = SelectBookAction | DeleteBookAction;
