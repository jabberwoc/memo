const {
  app,
  BrowserWindow,
  Menu
} = require('electron'),
  settings = require('electron-settings'),
  path = require('path');

let win = null;

function createWindow() {
  require('./menu');

  // Initialize the window to our specified dimensions
  win = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#444',
    icon: path.join(__dirname, 'icons/64x64.png')
  });
  const winBounds = settings.get('winBounds');
  if (winBounds) {
    win.setBounds(winBounds);
  }
  const winMaximized = settings.get('winMaximized');
  if (winMaximized === true) {
    win.maximize();
  }

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
