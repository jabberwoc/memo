export interface ConfigStore {
  items: Array<ConfigItem>;
}

export class ConfigItem<T = any> {
  readonly key: string;
  readonly type: ConfigItemType;
  value: T;

  constructor(key: string, type: ConfigItemType, value?: T) {
    this.key = key;
    this.type = type;
    this.value = value;
  }
}

export enum ConfigItemType {
  All,
  Electron,
  Browser
}

export const ConfigItemKeys = {
  REMOTE_URL: new ConfigItem<string>('remoteUrl', ConfigItemType.All),
  NATIVE_WINDOW: new ConfigItem<boolean>('nativeWindow', ConfigItemType.Electron, true)
};
