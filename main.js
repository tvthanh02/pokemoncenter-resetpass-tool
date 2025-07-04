const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const bruteForce = require('./modules/bruteForceBrowser');
const { generateDOBList } = require('./modules/dobList');

let mainWindow;
let isRunning = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  mainWindow.loadFile('renderer.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('select-email-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: 'Text Files', extensions: ['txt'] }],
    properties: ['openFile']
  });
  if (canceled) return null;
  return filePaths[0];
});

ipcMain.handle('write-log', async (event, logContent) => {
  const { filePath } = await dialog.showSaveDialog({
    title: 'Lưu file log',
    defaultPath: 'dobfill.log',
    filters: [{ name: 'Log Files', extensions: ['log', 'txt'] }]
  });
  if (!filePath) return false;
  await fs.writeFile(filePath, logContent, 'utf8');
  return true;
});

ipcMain.handle('read-email-file', async (event, filePath) => {
  return await fs.readFile(filePath, 'utf8');
});

ipcMain.handle('start-brute-force', async (event, emails, selectedRanges) => {
  if (isRunning) return false;
  isRunning = true;
  
  // Generate DOB list based on selected ranges
  const dobList = generateDOBList(selectedRanges);
  
  for (let i = 0; i < emails.length; i++) {
    if (!isRunning) break;
    const email = emails[i];
    
    // Gửi progress update
    mainWindow.webContents.send('progress-update', {
      current: i + 1,
      total: emails.length,
      email: email
    });
    
    // Chạy bruteForce cho email hiện tại với custom DOB list
    await bruteForce(email, (logLine) => {
      mainWindow.webContents.send('log-update', logLine);
    }, () => isRunning, dobList);
  }
  
  isRunning = false;
  mainWindow.webContents.send('progress-update', { completed: true });
  return true;
});

ipcMain.handle('stop-brute-force', () => {
  isRunning = false;
  return true;
}); 