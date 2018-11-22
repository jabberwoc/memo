import { Injectable } from '@angular/core';
import { ConfigStore, ConfigItemType, ConfigItem, ConfigItemKeys } from './config-store';
import { ElectronService } from 'ngx-electron';
import { NGXLogger } from 'ngx-logger';
import lodash from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private configName = 'memo_config';
  private configStore: ConfigStore;

  constructor(private logger: NGXLogger, private electronService: ElectronService) {
    const storageConfig: ConfigStore = JSON.parse(
      localStorage.getItem(this.configName) ||
        JSON.stringify({
          items: []
        })
    );

    storageConfig.items = lodash.unionBy(
      storageConfig.items,
      Object.values(ConfigItemKeys),
      _ => _.key
    );

    if (this.electronService.isElectronApp) {
      const electronConfig = this.electronService.ipcRenderer.sendSync('getConfig');
      storageConfig.items.push(electronConfig.items);
    }

    this.configStore = {
      items: storageConfig.items.filter(
        _ =>
          _.type === ConfigItemType.All ||
          _.type ===
            (this.electronService.isElectronApp ? ConfigItemType.Electron : ConfigItemType.Browser)
      )
    };
  }

  public updateItem(item: ConfigItem): void {
    // TODO
  }

  public updateConfig(config: ConfigStore): void {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.sendSync('saveConfig', {
        items: config.items.filter(_ => _.type === ConfigItemType.Electron)
      });
    }

    this.saveStorageConfig({ items: config.items.filter(_ => _.type !== ConfigItemType.Electron) });
  }

  public getConfig(): ConfigStore {
    return this.configStore;
  }

  private saveStorageConfig(config: ConfigStore) {
    const configJson = JSON.stringify(config);
    this.logger.info(`saving config => ${configJson}`);
    localStorage.setItem(this.configName, configJson);
  }
}
