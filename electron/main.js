const { app, BrowserWindow } = require('electron')
const path = require('path')

// Enable kiosk mode via command line arg
const KIOSK_MODE = process.argv.includes('--kiosk')

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 600,
    fullscreen: KIOSK_MODE,
    kiosk: KIOSK_MODE,
    frame: !KIOSK_MODE,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    win.loadURL('http://localhost:5173')
    // Open DevTools in development
    if (!KIOSK_MODE) {
      win.webContents.openDevTools()
    }
  } else {
    // In production, load the built files
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
