const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('countdownAPI', {
  loadCountdowns: () => ipcRenderer.invoke('countdowns:load'),
  saveCountdowns: (countdowns) => ipcRenderer.invoke('countdowns:save', countdowns),
  exportCountdowns: (countdowns) => ipcRenderer.invoke('countdowns:export', countdowns),
  importCountdowns: () => ipcRenderer.invoke('countdowns:import'),
  exportIcs: (countdowns) => ipcRenderer.invoke('countdowns:export-ics', countdowns),
  importIcs: () => ipcRenderer.invoke('countdowns:import-ics'),
  fetchWeather: (city, context) => ipcRenderer.invoke('weather:fetch', city, context),
  toggleMiniWindow: () => ipcRenderer.invoke('window:toggle-mini'),
  showError: (title, message) => ipcRenderer.invoke('dialog:error', title, message),
  showMessage: (title, message) => ipcRenderer.invoke('dialog:message', title, message)
})
