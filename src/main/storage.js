const fs = require('fs/promises')
const path = require('path')

const DEFAULT_REMINDERS = [1440, 60, 10]
const VALID_CATEGORIES = new Set(['birthday', 'work', 'exam', 'travel', 'anniversary', 'custom'])

function dataFilePath(app) {
  return path.join(app.getPath('userData'), 'countdowns.json')
}

function normalizeReminderMinutes(value) {
  if (!Array.isArray(value)) return DEFAULT_REMINDERS

  return [...new Set(value.map(Number))]
    .filter((minutes) => Number.isFinite(minutes) && minutes >= 0)
    .sort((a, b) => b - a)
}

function normalizeCountdowns(value) {
  if (!Array.isArray(value)) return []

  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const now = Date.now()
      const targetTime = Number(item.targetTime || now)
      const startTime = Number(item.startTime || item.createdAt || now)
      const category = VALID_CATEGORIES.has(item.category) ? item.category : 'custom'

      return {
        id: String(item.id || now),
        name: String(item.name || '未命名事件'),
        targetTime,
        startTime,
        createdAt: Number(item.createdAt || startTime || now),
        city: String(item.city || ''),
        category,
        notes: String(item.notes || ''),
        reminderMinutes: normalizeReminderMinutes(item.reminderMinutes),
        archived: Boolean(item.archived),
        archivedAt: item.archivedAt ? Number(item.archivedAt) : null
      }
    })
    .filter((item) => Number.isFinite(item.targetTime) && Number.isFinite(item.startTime))
}

async function loadCountdowns(app) {
  try {
    const text = await fs.readFile(dataFilePath(app), 'utf8')
    return normalizeCountdowns(JSON.parse(text))
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

async function saveCountdowns(app, countdowns) {
  const filePath = dataFilePath(app)
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, `${JSON.stringify(normalizeCountdowns(countdowns), null, 2)}\n`, 'utf8')
  return { ok: true }
}

async function exportCountdowns(filePath, countdowns) {
  await fs.writeFile(filePath, `${JSON.stringify(normalizeCountdowns(countdowns), null, 2)}\n`, 'utf8')
  return { ok: true }
}

async function importCountdowns(filePath) {
  const text = await fs.readFile(filePath, 'utf8')
  return normalizeCountdowns(JSON.parse(text))
}

module.exports = { loadCountdowns, saveCountdowns, importCountdowns, exportCountdowns, normalizeCountdowns }
