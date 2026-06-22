const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const { loadCountdowns, saveCountdowns, importCountdowns, exportCountdowns } = require('./storage')

function createWindow () {
  const win = new BrowserWindow({
    width: 1050,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    autoHideMenuBar: true, // Hide default system menu
    title: "Beautiful Countdown",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  win.loadFile(path.join(__dirname, '../renderer/index.html'))
}

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function registerIpcHandlers () {
  ipcMain.handle('countdowns:load', () => loadCountdowns(app))
  ipcMain.handle('countdowns:save', (_event, countdowns) => saveCountdowns(app, countdowns))

  ipcMain.handle('countdowns:export', async (_event, countdowns) => {
    const result = await dialog.showSaveDialog({
      title: '导出倒计时备份',
      defaultPath: 'countdowns-backup.json',
      filters: [{ name: 'JSON 文件', extensions: ['json'] }]
    })
    if (result.canceled || !result.filePath) return { canceled: true }
    await exportCountdowns(result.filePath, countdowns)
    return { canceled: false, filePath: result.filePath }
  })

  ipcMain.handle('countdowns:import', async () => {
    const result = await dialog.showOpenDialog({
      title: '导入倒计时备份',
      properties: ['openFile'],
      filters: [{ name: 'JSON 文件', extensions: ['json'] }]
    })
    if (result.canceled || result.filePaths.length === 0) return { canceled: true }
    const countdowns = await importCountdowns(result.filePaths[0])
    await saveCountdowns(app, countdowns)
    return { canceled: false, countdowns }
  })

  ipcMain.handle('weather:fetch', async (_event, city) => {
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3'
    const { execFile } = require('child_process')

    return new Promise((resolve) => {
      execFile(pythonCmd, ['-m', 'weather_agent', city], {
        cwd: path.join(__dirname, '..', '..'),
        timeout: 15000,
        encoding: 'utf-8',
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
      }, (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            resolve({ error: '天气查询超时，请稍后重试。' })
          } else if (error.code === 'ENOENT') {
            resolve({ error: '未找到 Python 环境，请确保已安装 Python 并添加到系统 PATH。' })
          } else {
            resolve({ error: `天气查询失败：${stderr || error.message}` })
          }
          return
        }

        const text = stdout.trim()
        if (!text) {
          resolve({ error: '天气查询返回为空，请稍后重试。' })
          return
        }

        try {
          resolve(JSON.parse(text))
        } catch (parseError) {
          resolve({ error: '天气数据解析失败，请稍后重试。' })
        }
      })
    })
  })
}
