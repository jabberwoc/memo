import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FsService } from 'ngx-fs';
import { ElectronService } from 'ngx-electron';
import { DataService } from '../data/data.service';
import { BookDto, Book } from '../data/entities/book';
import { Dictionary } from 'lodash';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  pageTitle = 'Settings';
  configItems: Dictionary<string> = {};
  remoteUrl = new FormControl('');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private electronService: ElectronService,
    private fsService: FsService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      console.log('settings params: + ' + params);
    });

    let remoteUrl = this.getConfigValue('remoteUrl');
    if (!remoteUrl) {
      remoteUrl = '';
    }
    this.configItems['remoteUrl'] = remoteUrl;
  }

  navigateBack(): void {
    this.router.navigate(['books']);
  }

  getConfigValue(key: string): string {
    return localStorage.getItem(key);
  }

  setConfigValue(key: string): void {
    localStorage.setItem(key, this.configItems[key]);
  }

  export(): void {
    this.dataService.getBooks().then(books => {
      Promise.all(
        books.map(book =>
          this.dataService.getNotes(book.id).then(notes => new BookDto(book, notes))
        )
      ).then(data => {
        const jsonExport = JSON.stringify(data);
        console.log(jsonExport);

        const savePath = this.electronService.remote.dialog.showSaveDialog({
          title: 'Export data',
          defaultPath: 'memo-export.json'
        });

        (<any>this.fsService.fs).writeFile(savePath, jsonExport, err => {
          if (err) {
            return console.log('error exporting memo data: ' + err);
          }

          console.log('memo data exported successfully.');
        });
      });
    });
  }

  // TODO remove
  export2(): void {
    this.dataService.getBooks().then(books => {
      Promise.all(books.map(book => this.dataService.getNotes(book.id))).then(result => {
        const notes = Array.prototype.concat(...result);
        const jsonExport = JSON.stringify({ books: books, notes: notes });
        console.log(jsonExport);

        const savePath = this.electronService.remote.dialog.showSaveDialog({
          title: 'Export data',
          defaultPath: 'memo-export.json'
        });

        (<any>this.fsService.fs).writeFile(savePath, jsonExport, err => {
          if (err) {
            return console.log('error exporting memo data: ' + err);
          }

          console.log('memo data exported successfully.');
        });
      });
    });
  }

  import(): void {
    // open file
    const filePath = this.electronService.remote.dialog.showOpenDialog({
      title: 'Import data',
      properties: ['openFile']
    })[0];

    (<any>this.fsService.fs).readFile(filePath, (err, data) => {
      if (err) {
        throw err;
      }
      // parse json data
      const memoData = JSON.parse(data);

      // save books & notes
      Promise.all(
        memoData.map(b =>
          this.dataService.createBook(b).then(result => {
            if (result) {
              b.notes.forEach(n => (n.book = result.id));
              return this.dataService.createNotes(b.notes).then(notes => {
                if (notes) {
                  console.log('Book ' + result.id + ' imported with ' + notes.length + ' notes..');
                  return result;
                }
              });
            }
          })
        )
      ).then(_ => console.log('Import finished.'));
    });
  }
}
