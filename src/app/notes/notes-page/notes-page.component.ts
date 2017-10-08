import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Book } from '../../entities/book';
import 'rxjs/add/operator/switchMap';
import { DataService } from '../../data/data.service';
import { Note } from '../../entities/note';
import { MdDialog } from '@angular/material';
import { AddNoteComponent } from './dialog/add-note/add-note.component';

@Component({
  selector: 'app-notes-page',
  templateUrl: './notes-page.component.html',
  styleUrls: ['./notes-page.component.css']
})
export class NotesPageComponent implements OnInit {

  book: Book;
  notes: Array<Note> = [];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private dialog: MdDialog,
    private dataService: DataService) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params => {
      console.log('params: + ' + params);

      this.book = new Book(params.get('bookId'), params.get('name'), 0);

      this.dataService.getBook(params.get('bookId'))
        .then(book => {
          this.book = book;
          console.log('selected book: ' + this.book.name + '... loading notes..');
          this.loadNotes(this.book.id);
        });

    }));
  }

  loadNotes(bookId: string): void {
    this.dataService.getNotes(bookId)
      .then(notes => {
        this.notes = notes;
        console.log(notes);
      });
  }

  addNote(): void {
    // TODO ngx-modialog
    const dialogRef = this.dialog.open(AddNoteComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name) {
        const newNote = new Note(null, name, this.book.id, '', null);
        this.dataService.createNote(newNote)
          .then(ok => {
            if (ok) {
              console.log('created new note: [' + newNote.id + '] ' + name);
              this.notes.push(newNote);

              // TODO update book
            } else {
              console.log('error creating book: ' + ok);
            }
          });
      }
    });
  }

  closeBook(): void {
    console.log('closing book: ' + this.book.id + ', name: ' + this.book.name);
    this.router.navigate(['books', this.book.id]);
  }
}
