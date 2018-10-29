import { Component } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  window: Electron.BrowserWindow;

  constructor(private electronService: ElectronService) {
    if (this.isElectronApp()) {
      this.window = this.electronService.remote.getCurrentWindow();
    }
  }

  isElectronApp(): boolean {
    return this.electronService.isElectronApp;
  }

  minimize(): void {
    if (window) {
      this.window.minimize();
    }
  }

  close(): void {
    if (window) {
      this.window.close();
    }
  }

  toggleMaxRestore(): void {
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
