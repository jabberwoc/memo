import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('memo', {
  openDialog: ipcRenderer.send('open-save-file-dialog')
});
