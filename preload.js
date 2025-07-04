const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectEmailFile: () => ipcRenderer.invoke('select-email-file'),
  writeLog: (logContent) => ipcRenderer.invoke('write-log', logContent),
  startBruteForce: (emails, selectedRanges, concurrency) => ipcRenderer.invoke('start-brute-force', emails, selectedRanges, concurrency),
  stopBruteForce: () => ipcRenderer.invoke('stop-brute-force'),
  stopSingleEmail: (email) => ipcRenderer.invoke('stop-single-email', email),
  onLogUpdate: (callback) => ipcRenderer.on('log-update', callback),
  onProgressUpdate: (callback) => ipcRenderer.on('progress-update', callback),
  readEmailFile: (filePath) => ipcRenderer.invoke('read-email-file', filePath),
  getCpuCount: () => ipcRenderer.invoke('get-cpu-count')
}); 