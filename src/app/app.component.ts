import { Component } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  window: Electron.BrowserWindow;
  useNativeWindow: boolean;

  constructor(private electronService: ElectronService) {
    this.useNativeWindow = localStorage.getItem('nativeWindow') === 'true';
    if (this.hasCustomWindow()) {
      this.window = this.electronService.remote.getCurrentWindow();
    }
  }

  public hasCustomWindow(): boolean {
    return !this.useNativeWindow && this.electronService.isElectronApp;
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
