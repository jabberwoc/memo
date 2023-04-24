import { Note } from '../model/entities/note';
import { Book } from '../model/entities/book';
import * as StoreActions from './actions';
import {
  SET_NOTES,
  ADD_NOTE,
  UPDATE_NOTE,
  ADD_OR_UPDATE_NOTE,
  DELETE_NOTE,
  SELECT_NOTE,
  SET_BOOKS,
  ADD_BOOK,
  UPDATE_BOOK,
  DELETE_BOOK,
  ADD_OR_UPDATE_BOOK,
  SELECT_BOOK
} from './actions';

export interface MemoStore {
  notes: Array<Note>;
  books: Array<Book>;
  selectedBook: Book;
  selectedNoteId: string;
}

export function notes(state: Array<Note> = [], action: StoreActions.NoteActions) {
  switch (action.type) {
    case SET_NOTES:
      return action.payload;
    case ADD_NOTE:
      return [...state, action.payload];
    case UPDATE_NOTE:
      return state.map(note => {
        if (note.id === action.payload.id && action.payload.modified > note.modified) {
          return new Note(
            action.payload.id,
            action.payload.name,
            action.payload.book,
            action.payload.content,
            action.payload.modified,
            action.payload.attachments
          );
        }

        return note;
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

export function selectedBook(state: Book = null, action: StoreActions.SelectBookActions) {
  switch (action.type) {
    case SELECT_BOOK:
      return action.payload;
    case DELETE_BOOK:
      return state === null || action.payload === state.id ? null : state;
    default:
      return state;
  }
}

export function books(state: Array<Book> = [], action: StoreActions.BookActions) {
  switch (action.type) {
    case SET_BOOKS:
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
