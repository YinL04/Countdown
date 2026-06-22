const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('countdownAPI', {
  loadCountdowns: () => ipcRenderer.invoke('countdowns:load'),
  saveCountdowns: (countdowns) => ipcRenderer.invoke('countdowns:save', countdowns),
  exportCountdowns: (countdowns) => ipcRenderer.invoke('countdowns:export', countdowns),
  importCountdowns: () => ipcRenderer.invoke('countdowns:import'),
  fetchWeather: (city) => ipcRenderer.invoke('weather:fetch', city)
})
