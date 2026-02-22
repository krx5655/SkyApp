const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { exec } = require('child_process')

// Enable kiosk mode via command line arg
const KIOSK_MODE = process.argv.includes('--kiosk')

// Root directory of the app (one level up from electron/)
const APP_ROOT = path.join(__dirname, '..')

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

  if (process.env.NODE_ENV === 'development') {
    // Development: load from Vite dev server
    win.loadURL('http://localhost:5173')
    if (!KIOSK_MODE) {
      win.webContents.openDevTools()
    }
  } else {
    // Production: load the built files from dist/
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

// Exit the app
ipcMain.handle('exit-app', () => {
  app.quit()
})

// Check for updates by comparing local HEAD to origin/main
ipcMain.handle('check-for-updates', async () => {
  return new Promise((resolve) => {
    exec('git fetch origin main && git log HEAD..origin/main --oneline', { cwd: APP_ROOT }, (error, stdout) => {
      if (error) {
        resolve({ error: 'Could not reach GitHub. Check your network connection.' })
        return
      }
      const commits = stdout.trim()
      resolve({
        hasUpdates: commits.length > 0,
        commitCount: commits ? commits.split('\n').length : 0,
      })
    })
  })
})

// Pull latest from GitHub, rebuild, then relaunch
ipcMain.handle('perform-update', async () => {
  return new Promise((resolve) => {
    exec(
      'git pull origin main && npm install && npm run build',
      { cwd: APP_ROOT, timeout: 300000 },
      (error) => {
        if (error) {
          resolve({ success: false, error: 'Update failed. Check your network connection and try again.' })
          return
        }
        resolve({ success: true })
        // Brief delay to allow the success response to reach the renderer before restart
        setTimeout(() => {
          app.relaunch()
          app.exit(0)
        }, 1500)
      }
    )
  })
})
