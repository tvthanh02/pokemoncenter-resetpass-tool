const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectEmailFile: () => ipcRenderer.invoke('select-email-file'),
  writeLog: (logContent) => ipcRenderer.invoke('write-log', logContent),
  startBruteForce: (emails, selectedRanges) => ipcRenderer.invoke('start-brute-force', emails, selectedRanges),
  stopBruteForce: () => ipcRenderer.invoke('stop-brute-force'),
  onLogUpdate: (callback) => ipcRenderer.on('log-update', callback),
  onProgressUpdate: (callback) => ipcRenderer.on('progress-update', callback),
  readEmailFile: (filePath) => ipcRenderer.invoke('read-email-file', filePath)
}); 