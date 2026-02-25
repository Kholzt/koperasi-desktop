import { app, BrowserWindow, ipcMain, shell ,dialog  } from 'electron'
import { spawn } from 'child_process';
import fs from 'fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// Ganti import { autoUpdater } from 'electron-updater' dengan ini:
const { autoUpdater } = require('electron-updater');
// import { autoUpdater } from 'electron-updater';

// import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import '../server/Server.js';
import log from 'electron-log/main';
log.initialize();
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
const size = {
    width: 700,
    height: 500,
    minWidth: 700,
    minHeight: 500,
}
function createWindow() {
  win = new BrowserWindow({
   ...size,
   title:"Koperasi Saferine Jaya Mandiri",
   titleBarStyle: 'hidden',
    icon: "./public/images/logo/logo.jpg",
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },

  })
  win.maximize();


  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
ipcMain.handle('open-file', async (event, filePath) => {
  shell.showItemInFolder(filePath);
});

function startExpressServer() {
    const serverPath = path.join(process.env.APP_ROOT!, 'server', 'Server.js');

    const child = spawn('node', [serverPath], {
    //   stdio: 'inherit',
      stdio: 'ignore',
    //   shell: true,
      detached: true,
      windowsHide: true
    });

    child.on('error', (err) => {
      log.error('Failed to start Express server:', err);
    });

    log.info('Express server started');
}
app.whenReady().then(() => {
    startExpressServer();

    ipcMain.handle('save-pdf', async (_,judul, htmlString) => {
        const { filePath } = await dialog.showSaveDialog({
            title: 'Simpan Laporan Kas',
            defaultPath: judul,
            filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
        });

        if (!filePath) return { success: false };

        const win = new BrowserWindow({ show: false });

        // Load HTML string
        await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlString)}`);

        const pdfBuffer = await win.webContents.printToPDF({
            printBackground: true,
            pageSize: 'A4',
        });

        fs.writeFileSync(filePath, pdfBuffer);
        win.close();

        return { success: true, path: filePath };
    });

    autoUpdater.setFeedURL({
        provider: "github",
        owner: "kholzt",
        repo: "koperasi-desktop",
        private: true,
        token: process.env.GH_TOKEN
    });

    ipcMain.handle('check-update', async () => {
        return autoUpdater.checkForUpdates();
    });

    ipcMain.handle('install-update', () => {
        autoUpdater.quitAndInstall();
    });
    ipcMain.handle("get-app-version", () => {
        return app.getVersion();
    });

    /* =========================
        AUTO UPDATER EVENTS
    ========================= */
    autoUpdater.on('checking-for-update', () => {
        win?.webContents.send('update-status', 'checking');
    });

    autoUpdater.on('update-available', () => {
        win?.webContents.send('update-status', 'available');
    });

    autoUpdater.on('update-not-available', () => {
        win?.webContents.send('update-status', 'none');
    });

    autoUpdater.on('error', (err) => {
        win?.webContents.send('update-status', 'error');
        log.error('Updater error:', err);
    });

    autoUpdater.on('download-progress', (progress) => {
        win?.webContents.send('update-progress', Math.round(progress.percent));
    });

    autoUpdater.on('update-downloaded', () => {
        win?.webContents.send('update-status', 'downloaded');
    });
    createWindow();
    autoUpdater.checkForUpdates();


  });
