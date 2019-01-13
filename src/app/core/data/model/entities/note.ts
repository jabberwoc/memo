import { Attachment } from './attachment';

export class Note {
  id: string;
  name: string;
  book: string;
  content: string;
  modified: string;
  attachments: Array<Attachment> = [];

  constructor(
    id: string,
    name: string,
    book: string,
    content: string,
    modified: string,
    attachments?: Array<Attachment>
  ) {
    this.id = id;
    this.name = name;
    this.book = book;
    this.content = content;
    this.modified = modified;
    if (attachments) {
      this.attachments = attachments;
    }
  }

  public static modifiedComparer(a: Note, b: Note) {
    if (a.modified > b.modified) {
      return -1;
    }
    if (a.modified < b.modified) {
      return 1;
    }
    return 0;
  }

  public static isEqual(note1: Note, note2: Note): boolean {
    if (!note1 || !note2) {
      return false;
    }

    return (
      note1.id === note2.id &&
      note1.name === note2.name &&
      note1.book === note2.book &&
      note1.content === note2.content &&
      note1.attachments.length === note2.attachments.length
    );
  }
}

export class NoteDto {
  name: string;
  content: string;
  modified: string;

  constructor(name: string, content: string, modified: string) {
    this.name = name;
    this.content = content;
    this.modified = modified;
  }
}

export interface AttachmentId {
  note: Note;
  attachmentId: string;
}
