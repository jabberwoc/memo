export enum ConfigItems {
  REMOTE_URL = 'remoteUrl',
  NATIVE_WINDOW = 'nativeWindow'
}

export class ConfigItem<T = any> {
  key: string;
  value: T;
}
