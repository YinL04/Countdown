const { app, BrowserWindow, ipcMain, dialog, Notification, Tray, Menu, nativeImage } = require('electron')
const path = require('path')
const { execFile } = require('child_process')
const { loadCountdowns, saveCountdowns, importCountdowns, exportCountdowns, normalizeCountdowns } = require('./storage')

const MAX_TIMEOUT = 2 ** 31 - 1
const CATEGORY_LABELS = {
  birthday: '生日',
  work: '项目',
  exam: '考试',
  travel: '旅行',
  anniversary: '纪念日',
  custom: '其他'
}

let mainWindow = null
let tray = null
let isMiniWindow = false
let reminderTimers = []
let latestCountdowns = []

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1050,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    autoHideMenuBar: true,
    title: 'Beautiful Countdown',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function showMainWindow () {
  if (!mainWindow) createWindow()
  mainWindow.show()
  mainWindow.focus()
}

function buildTrayIcon () {
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill="#6366f1"/>
      <circle cx="16" cy="16" r="9" fill="none" stroke="white" stroke-width="3"/>
      <path d="M16 9v8l5 3" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `)
  return nativeImage.createFromDataURL(`data:image/svg+xml;charset=utf-8,${svg}`)
}

function createTray () {
  if (tray) return

  try {
    tray = new Tray(buildTrayIcon())
    tray.setToolTip('我的倒计时')
    tray.on('click', showMainWindow)
    updateTrayMenu()
  } catch (error) {
    console.warn(`Tray unavailable: ${error.message}`)
  }
}

function updateTrayMenu () {
  if (!tray) return

  const menu = Menu.buildFromTemplate([
    { label: '显示主窗口', click: showMainWindow },
    { label: isMiniWindow ? '退出小窗模式' : '进入小窗模式', click: () => toggleMiniWindow() },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() }
  ])
  tray.setContextMenu(menu)
}

function toggleMiniWindow () {
  showMainWindow()
  if (!mainWindow) return { ok: false }

  isMiniWindow = !isMiniWindow
  if (isMiniWindow) {
    mainWindow.setMinimumSize(360, 480)
    mainWindow.setSize(420, 560)
    mainWindow.setAlwaysOnTop(true, 'floating')
  } else {
    mainWindow.setAlwaysOnTop(false)
    mainWindow.setMinimumSize(800, 600)
    mainWindow.setSize(1050, 750)
  }
  updateTrayMenu()
  return { ok: true, isMiniWindow }
}

function setLongTimeout (callback, delay) {
  let timeout = null
  let cleared = false

  const schedule = (remaining) => {
    if (cleared) return
    timeout = setTimeout(() => {
      if (remaining > MAX_TIMEOUT) {
        schedule(remaining - MAX_TIMEOUT)
      } else {
        callback()
      }
    }, Math.min(remaining, MAX_TIMEOUT))
  }

  schedule(Math.max(0, delay))
  return {
    clear: () => {
      cleared = true
      if (timeout) clearTimeout(timeout)
    }
  }
}

function reminderText (minutes) {
  if (minutes >= 1440) return `还有 ${Math.round(minutes / 1440)} 天`
  if (minutes >= 60) return `还有 ${Math.round(minutes / 60)} 小时`
  if (minutes > 0) return `还有 ${minutes} 分钟`
  return '时间到了'
}

function notifyReminder (event, minutes) {
  if (!Notification.isSupported()) return

  const label = CATEGORY_LABELS[event.category] || '事件'
  const target = new Date(event.targetTime).toLocaleString('zh-CN')
  const notification = new Notification({
    title: `${reminderText(minutes)}：${event.name}`,
    body: `${label} · ${target}${event.city ? ` · ${event.city}` : ''}`,
    silent: false
  })
  notification.on('click', showMainWindow)
  notification.show()
}

function scheduleReminders (countdowns) {
  reminderTimers.forEach((timer) => timer.clear())
  reminderTimers = []
  latestCountdowns = normalizeCountdowns(countdowns)

  const now = Date.now()
  latestCountdowns
    .filter((event) => !event.archived && event.targetTime > now)
    .forEach((event) => {
      event.reminderMinutes.forEach((minutes) => {
        const remindAt = event.targetTime - minutes * 60 * 1000
        if (remindAt <= now) return

        reminderTimers.push(setLongTimeout(() => notifyReminder(event, minutes), remindAt - now))
      })
    })
}

function escapeIcsText (value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function unescapeIcsText (value) {
  return String(value || '')
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
}

function formatIcsDate (timestamp) {
  return new Date(timestamp).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function parseIcsDate (value) {
  if (!value) return Date.now()
  const text = value.trim()
  if (/^\d{8}T\d{6}Z$/.test(text)) {
    return Date.UTC(
      Number(text.slice(0, 4)),
      Number(text.slice(4, 6)) - 1,
      Number(text.slice(6, 8)),
      Number(text.slice(9, 11)),
      Number(text.slice(11, 13)),
      Number(text.slice(13, 15))
    )
  }
  if (/^\d{8}T\d{6}$/.test(text)) {
    return new Date(
      Number(text.slice(0, 4)),
      Number(text.slice(4, 6)) - 1,
      Number(text.slice(6, 8)),
      Number(text.slice(9, 11)),
      Number(text.slice(11, 13)),
      Number(text.slice(13, 15))
    ).getTime()
  }
  if (/^\d{8}$/.test(text)) {
    return new Date(Number(text.slice(0, 4)), Number(text.slice(4, 6)) - 1, Number(text.slice(6, 8)), 9, 0, 0).getTime()
  }
  const parsed = Date.parse(text)
  return Number.isFinite(parsed) ? parsed : Date.now()
}

function toIcs (countdowns) {
  const events = normalizeCountdowns(countdowns)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Beautiful Countdown//CN',
    'CALSCALE:GREGORIAN'
  ]

  events.forEach((event) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${escapeIcsText(event.id)}@beautiful-countdown`,
      `DTSTAMP:${formatIcsDate(Date.now())}`,
      `DTSTART:${formatIcsDate(event.targetTime)}`,
      `SUMMARY:${escapeIcsText(event.name)}`,
      `DESCRIPTION:${escapeIcsText(event.notes)}`,
      `LOCATION:${escapeIcsText(event.city)}`,
      `CATEGORIES:${escapeIcsText(CATEGORY_LABELS[event.category] || '其他')}`,
      `X-COUNTDOWN-CATEGORY:${event.category}`,
      `X-COUNTDOWN-REMINDERS:${event.reminderMinutes.join(',')}`,
      `X-COUNTDOWN-ARCHIVED:${event.archived ? 'TRUE' : 'FALSE'}`,
      'END:VEVENT'
    )
  })

  lines.push('END:VCALENDAR')
  return `${lines.join('\r\n')}\r\n`
}

function fromIcs (text) {
  const unfolded = text.replace(/\r?\n[ \t]/g, '')
  const eventBlocks = unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || []

  return normalizeCountdowns(eventBlocks.map((block, index) => {
    const fields = {}
    block.split(/\r?\n/).forEach((line) => {
      const colonIndex = line.indexOf(':')
      if (colonIndex === -1) return
      const rawKey = line.slice(0, colonIndex)
      const key = rawKey.split(';')[0].toUpperCase()
      fields[key] = line.slice(colonIndex + 1)
    })

    const targetTime = parseIcsDate(fields.DTSTART || fields.DUE || fields.DTEND)
    return {
      id: fields.UID ? unescapeIcsText(fields.UID).split('@')[0] : `${Date.now()}-${index}`,
      name: unescapeIcsText(fields.SUMMARY || '导入事件'),
      targetTime,
      startTime: Date.now(),
      createdAt: Date.now(),
      city: unescapeIcsText(fields.LOCATION || ''),
      category: fields['X-COUNTDOWN-CATEGORY'] || 'custom',
      notes: unescapeIcsText(fields.DESCRIPTION || ''),
      reminderMinutes: (fields['X-COUNTDOWN-REMINDERS'] || '1440,60,10').split(',').map(Number),
      archived: fields['X-COUNTDOWN-ARCHIVED'] === 'TRUE'
    }
  }))
}

async function registerIpcHandlers () {
  ipcMain.handle('countdowns:load', async () => {
    const countdowns = await loadCountdowns(app)
    scheduleReminders(countdowns)
    return countdowns
  })

  ipcMain.handle('countdowns:save', async (_event, countdowns) => {
    const result = await saveCountdowns(app, countdowns)
    scheduleReminders(countdowns)
    return result
  })

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
    return { canceled: false, countdowns }
  })

  ipcMain.handle('countdowns:export-ics', async (_event, countdowns) => {
    const result = await dialog.showSaveDialog({
      title: '导出到日历文件',
      defaultPath: 'countdowns.ics',
      filters: [{ name: '日历文件', extensions: ['ics'] }]
    })
    if (result.canceled || !result.filePath) return { canceled: true }
    await require('fs/promises').writeFile(result.filePath, toIcs(countdowns), 'utf8')
    return { canceled: false, filePath: result.filePath }
  })

  ipcMain.handle('countdowns:import-ics', async () => {
    const result = await dialog.showOpenDialog({
      title: '导入日历文件',
      properties: ['openFile'],
      filters: [{ name: '日历文件', extensions: ['ics'] }]
    })
    if (result.canceled || result.filePaths.length === 0) return { canceled: true }
    const text = await require('fs/promises').readFile(result.filePaths[0], 'utf8')
    return { canceled: false, countdowns: fromIcs(text) }
  })

  ipcMain.handle('weather:fetch', async (_event, city) => {
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3'

    return new Promise((resolve) => {
      execFile(pythonCmd, ['-m', 'weather_agent', city, '--json'], {
        cwd: path.join(__dirname, '..', '..'),
        timeout: 15000,
        encoding: 'utf-8',
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
      }, (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            resolve({ error: '天气查询超时，请稍后重试。' })
          } else if (error.code === 'ENOENT') {
            resolve({ error: '未找到 Python 环境，请确认已安装 Python 并添加到系统 PATH。' })
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
        } catch (_parseError) {
          resolve({ error: '天气数据解析失败，请稍后重试。' })
        }
      })
    })
  })

  ipcMain.handle('window:toggle-mini', () => toggleMiniWindow())
  ipcMain.handle('dialog:error', (_event, title, message) => {
    dialog.showErrorBox(title || '操作失败', message || '发生未知错误。')
    return { ok: true }
  })
  ipcMain.handle('dialog:message', async (_event, title, message) => {
    await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: title || '提示',
      message: message || ''
    })
    return { ok: true }
  })
}

app.whenReady().then(async () => {
  await registerIpcHandlers()
  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      showMainWindow()
    }
  })
})

app.on('before-quit', () => {
  reminderTimers.forEach((timer) => timer.clear())
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
