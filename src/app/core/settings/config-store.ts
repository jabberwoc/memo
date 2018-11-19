export class ConfigStore {
  items: Array<ConfigItem>;

  // public getItem(key: string): ConfigItem {
  //   return this.items.find(_ => _.key === key) || null;
  // }
}

export class ConfigItem<T = any> {
  key: string;
  type: ConfigItemType;
  value: T;
}

export enum ConfigItemType {
  All,
  Electron,
  Browser
}

export const ConfigItemKeys = { REMOTE_URL: 'remoteUrl' };
