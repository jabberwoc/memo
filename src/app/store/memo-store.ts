import { Note } from '../entities/note';
import { Book } from '../entities/book';
import * as StoreActions from './actions';
import { ADD_NOTES, ADD_NOTE, UPDATE_NOTE, DELETE_NOTE, SELECT_NOTE, ADD_BOOKS, ADD_BOOK, UPDATE_BOOK, DELETE_BOOK } from './actions';

// export type Action = StoreActions.;

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
        const payload = action.payload;
        return note.id === payload.id ? new Note(payload.id, payload.name,
          payload.book, payload.content, payload.modified) : note;
      });
    case DELETE_NOTE:
      // TODO scan?
      return state.filter(note => {
        return note.id !== action.payload;
      });
    default:
      return state;
  }
}

export function selectedNoteId(state: string = null, action: StoreActions.SelectNoteAction) {
  switch (action.type) {
    case SELECT_NOTE:
      return action.payload;
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
      const payload = action.payload;
      return state.map(book => {
        return book.id === payload.id ? new Book(payload.id, payload.name,
          payload.count, payload.modified) : book;
      });
    case DELETE_BOOK:
      return state.filter(book => {
        return book.id !== action.payload;
      });
    default:
      return state;
  }
}
