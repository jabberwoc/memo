import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data/data.service';
import { BookDto } from '../data/model/entities/book';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ConnectionState } from './connection-state';
import { NGXLogger } from 'ngx-logger';
import { ConfigStore, ConfigItemType, ConfigItemKeys } from './config-store';
import { ConfigService } from './config.service';
import { ElectronService } from '../../electron.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  pageTitle = 'Settings';
  configGroup: FormGroup;

  remoteUrlState = ConnectionState.NONE;
  connectionState = ConnectionState;
  configStore: ConfigStore;

  @ViewChild('importElem') importElem: ElementRef;

  constructor(
    private router: Router,
    private dataService: DataService,
    private electronService: ElectronService,
    private configService: ConfigService,
    private http: HttpClient,
    private logger: NGXLogger,
    private fb: FormBuilder
  ) {
    this.initConfigItems();
  }

  private initConfigItems(): void {
    this.configStore = this.configService.getConfig();
    const formElements = this.configStore.items.reduce((obj, item) => {
      obj[item.key] = new FormControl(item.value);
      return obj;
    }, {});
    this.configGroup = this.fb.group(formElements);

    // validate remoteUrl
    this.validateRemoteUrl();
  }

  navigateBack(): void {
    this.router.navigate(['books']);
  }

  saveConfig(): void {
    // TODO set item values in local store
    this.configStore.items.forEach(item => (item.value = this.configGroup.get(item.key).value));

    this.configService.updateConfig(this.configStore);
  }

  setRemoteUrl(et: EventTarget): void {
    this.saveConfig();
    this.validateRemoteUrl();
    (et as HTMLInputElement).blur();
  }

  validateRemoteUrl(): void {
    if (!this.getConfigValue(ConfigItemKeys.REMOTE_URL.key)) {
      this.remoteUrlState = ConnectionState.NONE;
      return;
    }

    this.http
      .get(this.getConfigValue(ConfigItemKeys.REMOTE_URL.key), { observe: 'response' })
      .subscribe({
        next: response => {
          this.remoteUrlState = response.ok ? ConnectionState.OK : ConnectionState.ERROR;
        },
        error: () => (this.remoteUrlState = ConnectionState.ERROR)
      });
  }

  configItemExists(name: string): boolean {
    return this.configStore.items.some(_ => _.key === name);
  }

  getConfigValue(key: string): any {
    const item = this.configStore.items.find(_ => _.key === key);
    return item ? item.value : null;
  }

  async export(): Promise<void> {
    const data = await Promise.all(
      (await this.dataService.getBooks()).map(
        async book => new BookDto(book, await this.dataService.getNotes(book.id))
      )
    );

    const jsonExport = JSON.stringify(data);
    let success = false;
    if (this.electronService.isElectron) {
      success = await this.electronService.ipcRenderer.invoke('export-data', jsonExport);
    } else {
      // save in browser
      const blob = new Blob([jsonExport], { type: 'application/json' });
      saveAs(blob, 'memo-export.json');
    }

    if (success) {
      this.logger.info('memo data exported successfully.');
    }
  }

  openFile(): void {
    this.importElem.nativeElement.click();

  }

  async importInput(e): Promise<void> {
    const file = e.target.files[0];
    const memoData = await this.processFile(file);
    if (memoData) {
      await this.importData(JSON.parse(memoData));
    }
  }

  async import(): Promise<void> {

    if (this.electronService.isElectron) {
      const memoData = await this.electronService.ipcRenderer.invoke('import-data');
      await this.importData(memoData);
    } else {
      // open via browser
      this.openFile();
    }
  }

  async processFile(file: Blob): Promise<string> {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {

      reader.onload = (fileEvent) => {
        const fileContents = fileEvent.target.result as string;
        resolve(fileContents);
      };
      reader.onerror = () => {
        reject('oops, something went wrong with the file reader.');
      };
      reader.readAsText(file);
    });
  }

  async importData(memoData): Promise<void> {
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
    // TODO notification
  }

}
