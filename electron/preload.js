// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  exitApp: () => ipcRenderer.invoke('exit-app'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  performUpdate: () => ipcRenderer.invoke('perform-update'),
})
