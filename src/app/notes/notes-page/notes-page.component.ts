import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Book } from '../../entities/book';
import 'rxjs/add/operator/switchMap';
import { DataService } from '../../data/data.service';
import { Note } from '../../entities/note';

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

  closeBook(): void {
    console.log('closing book: ' + this.book.id + ', name: ' + this.book.name);
    this.router.navigate(['books', this.book.id]);
  }
}
