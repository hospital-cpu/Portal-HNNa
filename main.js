const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('save-pdf', async () => {
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    defaultPath: 'documento.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });

  if (canceled || !filePath) return;
  const pdf = await win.webContents.printToPDF({ printBackground: true });
  fs.writeFileSync(filePath, pdf);
});
