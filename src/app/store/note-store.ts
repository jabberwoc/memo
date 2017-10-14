import { Note } from '../entities/note';

export interface NoteStore {
  notes: Array<Note>;
  selectedNoteId: string;
}


export const ADD_NOTES = 'ADD_NOTES';
export const CREATE_NOTE = 'CREATE_NOTE';
export const UPDATE_NOTE = 'UPDATE_NOTE';
export const DELETE_NOTE = 'DELETE_NOTE';
export const SELECT_NOTE = 'SELECT_NOTE';

const noteReducer = (state, type, payload) => {
  switch (type) {
    case UPDATE_NOTE:
      if (state.id === payload.id) {
        return Object.assign({}, state, { name: payload.name, content: payload.content });
      }
      return state;

    default:
      return state;
  }
};

export function notes(state: Array<Note> = [], { type, payload }) {
  switch (type) {
    case ADD_NOTES:
      return payload;
    case CREATE_NOTE:
      return [...state, payload];
    case UPDATE_NOTE:
      return state.map(note => {
        // TODO
        return noteReducer(note, type, payload);
        // return note.id === payload.id ? Object.assign({}, note, payload) : note;
      });
    case DELETE_NOTE:
      // TODO scan?
      return state.filter(note => {
        return note.id !== payload.id;
      });
    default:
      return state;
  }
}

export function selectedNoteId(state: string = null, { type, payload }) {
  switch (type) {
    case SELECT_NOTE:
      return payload;
    // case UPDATE_NOTE:
    //   return state.id === payload.id ? Object.assign({}, state, payload) : state;
    default:
      return state;
  }
}

