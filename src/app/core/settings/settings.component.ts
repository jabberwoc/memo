import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FsService } from 'ngx-fs';
import { ElectronService } from 'ngx-electron';
import { DataService } from '../data/data.service';
import { BookDto } from '../data/model/entities/book';
import { Dictionary } from 'lodash';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ConnectionState } from './connection-state';
import { ConfigItems, ConfigItem } from './config-items';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  pageTitle = 'Settings';
  configElementPrefix = 'config/';
  configItems: Dictionary<string> = {};
  remoteUrl = new FormControl('');
  remoteUrlState = ConnectionState.NONE;
  connectionState = ConnectionState;
  configKeys = new Array<string>(ConfigItems.REMOTE_URL, ConfigItems.NATIVE_WINDOW);

  constructor(
    private router: Router,
    private dataService: DataService,
    private electronService: ElectronService,
    private fsService: FsService,
    private http: HttpClient,
    private logger: NGXLogger
  ) {
    this.addConfigItems();
  }

  private addConfigItems(): void {
    this.configKeys.forEach(key => (this.configItems[key] = this.getConfigValue(key)));

    // validate remoteUrl
    this.validateRemoteUrl();
  }

  navigateBack(): void {
    this.router.navigate(['books']);
  }

  getConfigValue(key: string): string {
    return localStorage.getItem(this.configElementPrefix + key);
  }

  setConfigValue(key: string): void {
    localStorage.setItem(this.configElementPrefix + key, this.configItems[key]);
  }

  setRemoteUrl(): void {
    if (this.configItems[ConfigItems.REMOTE_URL] === this.remoteUrl.value) {
      return;
    }
    this.configItems[ConfigItems.REMOTE_URL] = this.remoteUrl.value;
    this.setConfigValue(ConfigItems.REMOTE_URL);
    this.validateRemoteUrl();
  }

  resetRemoteUrl(): void {
    this.remoteUrl.setValue(this.configItems[ConfigItems.REMOTE_URL]);
  }

  validateRemoteUrl(): void {
    if (!this.configItems[ConfigItems.REMOTE_URL]) {
      this.remoteUrlState = ConnectionState.NONE;
      return;
    }

    this.http.get(this.configItems[ConfigItems.REMOTE_URL], { observe: 'response' }).subscribe(
      response => {
        this.remoteUrlState = response.ok ? ConnectionState.OK : ConnectionState.ERROR;
      },
      () => (this.remoteUrlState = ConnectionState.ERROR)
    );
  }

  async export(): Promise<void> {
    const data = await Promise.all(
      (await this.dataService.getBooks()).map(
        async book => new BookDto(book, await this.dataService.getNotes(book.id))
      )
    );

    const jsonExport = JSON.stringify(data);
    const savePath = this.electronService.remote.dialog.showSaveDialog({
      title: 'Export data',
      defaultPath: 'memo-export.json'
    });

    (<any>this.fsService.fs).writeFile(savePath, jsonExport, err => {
      if (err) {
        this.logger.error('error exporting memo data: ' + err);
        return;
      }

      this.logger.debug('memo data exported successfully.');
    });
  }

  import(): void {
    // open file
    const filePath = this.electronService.remote.dialog.showOpenDialog({
      title: 'Import data',
      properties: ['openFile']
    })[0];

    (<any>this.fsService.fs).readFile(filePath, async (err, data) => {
      if (err) {
        throw err;
      }
      // parse json data
      const memoData = JSON.parse(data);

      // save books & notes
      await Promise.all(
        memoData.map(b =>
          this.dataService.createBook(b).then(async result => {
            if (result) {
              b.notes.forEach(n => (n.book = result.id));
              const notes = await this.dataService.createNotes(b.notes);
              if (notes) {
                this.logger.debug(`book: [${result.id}] imported with ${notes.length} notes`);
                return result;
              }
            }
          })
        )
      );
      this.logger.debug('Import finished.');
    });
  }
}
