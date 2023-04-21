const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  safeStorage
} = require('electron'),
  settings = require('electron-settings'),
  path = require('path')
fs = require('fs/promises');
require('@electron/remote/main').initialize();
require('dotenv').config();

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
    icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // TODO remove?
      enableRemoteModule: true
    }
  });

  const winBounds = settings.getSync('winBounds');
  if (winBounds) {
    win.setBounds(winBounds);
  }
  const winMaximized = settings.getSync('winMaximized');
  if (winMaximized === true) {
    win.maximize();
  }

  // Specify entry point
  if (process.env.PACKAGE === 'true') {
    win.loadURL(`file://${__dirname}/build/index.html`);
  } else {
    win.loadURL('http://localhost:4200');
  }

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
          frame: true
        });
        const childWindow = new BrowserWindow(options);
        childWindow.setMenu(null);
        event.newGuest = childWindow;
      } else {
        // prevent child window and open external
        event.preventDefault();
        require('electron').shell.openExternal(url);
      }
    }
  );
}

function getConfig() {
  const config =
    settings.getSync('config') ||
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

app.on('browser-window-created', (_, window) => {
  require("@electron/remote/main").enable(window.webContents)
})

ipcMain.on('getConfig', (e, arg) => {
  e.returnValue = getConfig();
});

ipcMain.on('saveConfig', (e, arg) => {
  settings.set('config', JSON.stringify(arg));
  e.returnValue = true;
});


ipcMain.handle('saveAutoLogin', (e, arg) => {
  console.log('saving auto login credentials')
  const buffer = safeStorage.encryptString(JSON.stringify(arg));
  settings.setSync('auto-login', buffer.toString('base64'));

  // TODO remove?
  e.returnValue = true;
});

ipcMain.handle('getAutoLogin', async (e, arg) => {
  if (!safeStorage.isEncryptionAvailable() || !arg) {
    return
  }

  const value = await settings.get('auto-login')
  if (!value) {
    return
  }

  const decrypted = safeStorage.decryptString(Buffer.from(value, 'base64'));
  const auth = JSON.parse(decrypted)

  const username = auth['username']
  const password = auth['password']

  if (username === arg) {
    return password
  }
  console.error('auto login failed: username mismatch for requested credentials')

});

ipcMain.on('open-files-file-dialog', () => {
  dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections']
  })
});

ipcMain.handle('export-data', async (e, jsonExport) => {
  const dialogResult = await dialog.showSaveDialog({
    title: 'Export data',
    defaultPath: 'memo-export.json'
  });

  if (dialogResult.canceled || !dialogResult.filePath) {
    return false;
  }


  return fs.writeFile(dialogResult.filePath, jsonExport, err => {
    if (err) {
      console.error('error exporting memo data: ' + err);
      return false;
    }

    return true;
  });
})

ipcMain.handle('import-data', async (e, args) => {
  const dialogResult = await dialog.showOpenDialog({
    title: 'Import data',
    defaultPath: 'memo-export.json',
    properties: ['openFile']
  });

  console.log(dialogResult)

  if (dialogResult.canceled || !dialogResult.filePaths || !dialogResult.filePaths[0]) {
    return false;
  }

  const data = await fs.readFile(dialogResult.filePaths[0], 'utf-8');
  return JSON.parse(Buffer.from(data));
})
