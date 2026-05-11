// Safe preload bridge for the Electron desktop application.
const { contextBridge, shell, app } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openUrl: (url) => shell.openExternal(url),
  getAppVersion: () => app.getVersion()
});
