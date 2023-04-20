import { Component } from '@angular/core';
import { ConfigService } from './core/settings/config.service';
import { ElectronService } from './electron.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  window: Electron.BrowserWindow;
  useNativeWindow: boolean;

  constructor(private electronService: ElectronService, private configService: ConfigService) {
    this.useNativeWindow = this.configService.getConfigValue('nativeWindow') || false;
    if (this.hasCustomWindow()) {
      this.window = this.electronService.remote.getCurrentWindow();
    }
  }

  public hasCustomWindow(): boolean {
    return !this.useNativeWindow && this.electronService.isElectron;
  }

  public minimize(): void {
    if (window) {
      this.window.minimize();
    }
  }

  public close(): void {
    if (window) {
      this.window.close();
    }
  }

  public toggleMaxRestore(): void {
    if (!window) {
      return;
    }
    if (this.window.isMaximized()) {
      this.window.unmaximize();
    } else {
      this.window.maximize();
    }
  }
}
