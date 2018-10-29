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
    this.window = this.electronService.remote.getCurrentWindow();
  }

  minimize(): void {
    this.window.minimize();
  }

  close(): void {
    this.window.close();
  }

  toggleMaxRestore(): void {
    if (this.window.isMaximized()) {
      this.window.unmaximize();
    } else {
      this.window.maximize();
    }
  }
}
