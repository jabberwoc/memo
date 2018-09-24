import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FsService } from 'ngx-fs';
import { ElectronService } from 'ngx-electron';
import { DataService } from '../data/data.service';
import { BookDto } from '../data/entities/book';
import { Dictionary } from 'lodash';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ConnectionState } from './connection-state';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  pageTitle = 'Settings';
  configItems: Dictionary<string> = {};
  remoteUrl = new FormControl('');
  remoteUrlState = ConnectionState.NONE;
  connectionState = ConnectionState;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private electronService: ElectronService,
    private fsService: FsService,
    private http: HttpClient
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
    this.remoteUrl.setValue(remoteUrl);
    this.validateRemoteUrl();
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

  setRemoteUrl(): void {
    const remoteUrlKey = 'remoteUrl';
    if (this.configItems[remoteUrlKey] === this.remoteUrl.value) {
      return;
    }
    this.configItems[remoteUrlKey] = this.remoteUrl.value;
    this.setConfigValue(remoteUrlKey);
    this.validateRemoteUrl();
  }

  resetRemoteUrl(): void {
    this.remoteUrl.setValue(this.configItems['remoteUrl']);
  }

  validateRemoteUrl(): void {
    if (!this.configItems['remoteUrl']) {
      this.remoteUrlState = ConnectionState.NONE;
      return;
    }

    console.log('Validating remoteUrl...');
    this.http.get(this.configItems['remoteUrl'], { observe: 'response' }).subscribe(
      response => {
        this.remoteUrlState = response.ok ? ConnectionState.OK : ConnectionState.ERROR;
      },
      () => (this.remoteUrlState = ConnectionState.ERROR)
    );
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
