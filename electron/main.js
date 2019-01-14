const { app, BrowserWindow, ipcMain } = require('electron'),
  settings = require('electron-settings'),
  path = require('path');

let win = null;

function createWindow() {
  require('./menu');
  const windowSetting = getConfig().items.find(_ => _.key === 'nativeWindow');
  const nativeWindow = windowSetting ? windowSetting.value : false;

  // Initialize the window to our specified dimensions
  win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: nativeWindow,
    backgroundColor: '#444',
    icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
    webPreferences: {
      nativeWindowOpen: true
    }
  });

  const winBounds = settings.get('winBounds');
  if (winBounds) {
    win.setBounds(winBounds);
  }
  const winMaximized = settings.get('winMaximized');
  if (winMaximized === true) {
    win.maximize();
  }

  // Specify entry point
  win.loadURL(`file://${__dirname}/index.html`);

  win.on('close', e => {
    settings.set('winBounds', win.getBounds());
    settings.set('winMaximized', win.isMaximized());
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  win.webContents.on(
    'new-window',
    (event, url, frameName, disposition, options, additionalFeatures) => {
      if (frameName === 'child') {
        event.preventDefault();
        Object.assign(options, {
          parent: win,
          frame: true,
          backgroundColor: '#fff'
        });
        const childWindow = new BrowserWindow(options);
        childWindow.setMenu(null);
        event.newGuest = childWindow;
      }
    }
  );
}

function getConfig() {
  const config =
    settings.get('config') ||
    JSON.stringify({
      items: []
    });
  return JSON.parse(config);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});
ipcMain.on('getConfig', (e, arg) => {
  e.returnValue = getConfig();
});

ipcMain.on('saveConfig', (e, arg) => {
  settings.set('config', JSON.stringify(arg));
  e.returnValue = true;
});
