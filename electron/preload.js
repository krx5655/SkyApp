// Preload script for Electron
// Currently empty but ready for future IPC communication
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  // Future: Add any Node.js APIs we need to expose to renderer
})
