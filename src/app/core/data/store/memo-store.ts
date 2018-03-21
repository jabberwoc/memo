import { Note } from '../entities/note';
import { Book } from '../entities/book';
import * as StoreActions from './actions';
import {
  ADD_NOTES,
  ADD_NOTE,
  UPDATE_NOTE,
  ADD_OR_UPDATE_NOTE,
  DELETE_NOTE,
  SELECT_NOTE,
  ADD_BOOKS,
  ADD_BOOK,
  UPDATE_BOOK,
  DELETE_BOOK,
  ADD_OR_UPDATE_BOOK
} from './actions';

export interface MemoStore {
  notes: Array<Note>;
  books: Array<Book>;
  selectedNoteId: string;
}

export function notes(state: Array<Note> = [], action: StoreActions.NoteActions) {
  switch (action.type) {
    case ADD_NOTES:
      return action.payload;
    case ADD_NOTE:
      return [...state, action.payload];
    case UPDATE_NOTE:
      return state.map(note => {
        return note.id === action.payload.id
          ? new Note(
              action.payload.id,
              action.payload.name,
              action.payload.book,
              action.payload.content,
              action.payload.modified
            )
          : note;
      });
    case ADD_OR_UPDATE_NOTE:
      if (state.some(_ => _.id === action.payload.id)) {
        return notes(state, new StoreActions.UpdateNoteAction(action.payload));
      }
      return notes(state, new StoreActions.AddNoteAction(action.payload));
    case DELETE_NOTE:
      return state.filter(note => {
        return note.id !== action.payload;
      });
    default:
      return state;
  }
}

export function selectedNoteId(state: string = null, action: StoreActions.SelectNoteActions) {
  switch (action.type) {
    case SELECT_NOTE:
      return action.payload;
    case DELETE_NOTE:
      return action.payload === state ? null : state;
    default:
      return state;
  }
}

export function books(state: Array<Book> = [], action: StoreActions.BookActions) {
  switch (action.type) {
    case ADD_BOOKS:
      return action.payload;
    case ADD_BOOK:
      return [...state, action.payload];
    case UPDATE_BOOK:
      return state.map(book => {
        return book.id === action.payload.id
          ? new Book(
              action.payload.id,
              action.payload.name,
              action.payload.count,
              action.payload.modified
            )
          : book;
      });
    case ADD_OR_UPDATE_BOOK:
      if (state.some(_ => _.id === action.payload.id)) {
        return books(state, new StoreActions.UpdateBookAction(action.payload));
      }
      return books(state, new StoreActions.AddBookAction(action.payload));
    case DELETE_BOOK:
      return state.filter(book => {
        return book.id !== action.payload;
      });
    default:
      return state;
  }
}
