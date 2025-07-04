const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const { generateDOBList } = require('./modules/dobList');
const { fork } = require('child_process');

let mainWindow;
let isRunning = false;
let stoppedEmails = new Set();
let runningWorkers = {};

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

ipcMain.handle('stop-single-email', (event, email) => {
  stoppedEmails.add(email);
  if (runningWorkers[email]) {
    runningWorkers[email].send({ type: 'stop' });
  }
  return true;
});

// Hàm quản lý pool process
async function runProcessPool(emails, dobList, concurrency) {
  let completed = 0;
  const total = emails.length;
  let queue = [...emails];
  let active = 0;
  return new Promise((resolve) => {
    function launchNext() {
      while (active < concurrency && queue.length > 0) {
        const email = queue.shift();
        if (stoppedEmails.has(email)) continue;
        const worker = fork(path.join(__dirname, 'bruteWorker.js'));
        runningWorkers[email] = worker;
        active++;
        mainWindow.webContents.send('progress-update', {
          current: completed + 1,
          total,
          email
        });
        worker.on('message', (msg) => {
          if (msg.type === 'log') {
            mainWindow.webContents.send('log-update', `[${email}] ${msg.logLine}\n`);
          } else if (msg.type === 'done') {
            // done
          }
        });
        worker.on('exit', () => {
          active--;
          completed++;
          delete runningWorkers[email];
          if (completed >= total) {
            isRunning = false;
            mainWindow.webContents.send('progress-update', { completed: true });
            resolve();
          } else {
            launchNext();
          }
        });
        worker.send({ type: 'start', email, dobList });
      }
    }
    launchNext();
  });
}

ipcMain.handle('start-brute-force', async (event, emails, selectedRanges, concurrency) => {
  if (isRunning) return false;
  isRunning = true;
  stoppedEmails = new Set();
  runningWorkers = {};
  const dobList = generateDOBList(selectedRanges);
  await runProcessPool(emails, dobList, concurrency || 1);
  return true;
});

ipcMain.handle('stop-brute-force', () => {
  isRunning = false;
  Object.values(runningWorkers).forEach(worker => worker.send({ type: 'stop' }));
  return true;
});

ipcMain.handle('get-cpu-count', () => require('os').cpus().length); 