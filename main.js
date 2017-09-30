const { app, BrowserWindow } = require('electron'),
  settings = require('electron-settings');
require('dotenv').config();
// Reload file requires rebuild
// require('electron-reload')(__dirname);

const PouchDB = require('pouchdb')
// PouchDB.debug.enable('*')
const dbPath = require('path').join(__dirname, 'db'),
  db = new PouchDB(dbPath, { auto_compaction: true });
global.shared = {
  db: db
}

let win = null;

function createWindow() {

  // Initialize the window to our specified dimensions
  win = new BrowserWindow({ width: 1000, height: 600 });
  const winBounds = settings.get('winBounds')
  if (winBounds) {
    win.setBounds(winBounds)
  }

  // Specify entry point
  if (process.env.PACKAGE === 'true') {
    win.loadURL(`file://${__dirname}/dist/index.html`)
    // win.loadURL(url.format({
    //   pathname: path.join(__dirname, 'dist/index.html'),
    //   protocol: 'file:',
    //   slashes: true
    // }));
  } else {
    win.loadURL('http://localhost:4200');
    // win.webContents.openDevTools();
  }


  win.on('close', (e) => {
    settings.set('winBounds', win.getBounds())
  })

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })

  win.once('ready-to-show', () => {
    win.show()
  })
};


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})
