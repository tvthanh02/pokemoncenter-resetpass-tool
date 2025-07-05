const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const { generateDOBList } = require('./modules/dobList');
const { fork } = require('child_process');
const os = require('os');

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

// Hàm quản lý pool process tối ưu với concurrency cao
async function runProcessPoolOptimized(emails, dobList, concurrency) {
  let completed = 0;
  const total = emails.length;
  let queue = [...emails];
  let active = 0;
  let startTime = Date.now();

  return new Promise((resolve) => {
    function launchNext() {
      while (active < concurrency && queue.length > 0) {
        const email = queue.shift();
        if (stoppedEmails.has(email)) continue;

        const worker = fork(path.join(__dirname, 'bruteWorkerOptimized.js'));
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

          // Tính toán tốc độ
          const elapsed = (Date.now() - startTime) / 1000;
          const rate = Math.round(completed / elapsed * 60); // requests per minute

          if (completed >= total) {
            isRunning = false;
            mainWindow.webContents.send('progress-update', {
              completed: true,
              rate: rate
            });
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

  // Tự động tính toán concurrency tối ưu
  const optimalConcurrency = concurrency || Math.min(
    Math.max(10, Math.floor(os.cpus().length * 2)), // Ít nhất 10, tối đa CPU cores * 2
    50 // Giới hạn tối đa 50 workers
  );

  await runProcessPoolOptimized(emails, dobList, optimalConcurrency);
  return true;
});

ipcMain.handle('stop-brute-force', () => {
  isRunning = false;
  Object.values(runningWorkers).forEach(worker => worker.send({ type: 'stop' }));
  return true;
});

ipcMain.handle('get-cpu-count', () => {
  const cpuCount = os.cpus().length;
  return {
    cpuCount,
    recommendedConcurrency: Math.min(Math.max(10, cpuCount * 2), 50)
  };
}); 