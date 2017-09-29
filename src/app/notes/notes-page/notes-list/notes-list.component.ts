import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../../data/data.service';
import { Book } from '../../../entities/book';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.css']
})
export class NotesListComponent implements OnInit {

  @Input() book: Book;

  constructor(
    private dataService: DataService
  ) { }

  ngOnInit() {
  }

}
