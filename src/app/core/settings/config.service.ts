import { Injectable } from '@angular/core';
import { ConfigStore, ConfigItemType, ConfigItem, ConfigItemKeys } from './config-store';
import { NGXLogger } from 'ngx-logger';
import lodash from 'lodash';
import { ElectronService } from '../../electron.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private configName = 'memo_config';
  private configStore: ConfigStore;
  private configResponse: Promise<any>;

  constructor(private logger: NGXLogger, private electronService: ElectronService) {

    this.loadConfig();
  }

  public updateConfig(config: ConfigStore): void {
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.sendSync('saveConfig', {
        items: config.items.filter(_ => _.type === ConfigItemType.Electron)
      });
    }

    this.saveStorageConfig({ items: config.items.filter(_ => _.type !== ConfigItemType.Electron) });
  }

  public getConfig(): ConfigStore {
    return this.configStore;
  }

  public getConfigValue(key: string): any {
    const item = this.configStore.items.find(_ => _.key === key);
    return item ? item.value : null;
  }

  private saveStorageConfig(config: ConfigStore) {
    const configJson = JSON.stringify(config);
    this.logger.info(`saving config => ${configJson}`);
    localStorage.setItem(this.configName, configJson);
  }
  private loadConfig(): void {
    const storageConfig: ConfigStore = JSON.parse(
      localStorage.getItem(this.configName) ||
      JSON.stringify({
        items: []
      })
    );


    if (this.electronService.isElectron) {
      const electronConfig = this.electronService.ipcRenderer.sendSync('getConfig');
      storageConfig.items = lodash.unionBy(electronConfig.items, storageConfig.items, _ => _.key);
    }

    storageConfig.items = lodash.unionBy(
      storageConfig.items,
      Object.values(ConfigItemKeys),
      _ => _.key
    );

    this.configStore = {
      items: storageConfig.items.filter(
        _ =>
          _.type === ConfigItemType.All ||
          _.type ===
          (this.electronService.isElectron ? ConfigItemType.Electron : ConfigItemType.Browser)
      )
    };
  }
}

