const fs = require('fs/promises')
const path = require('path')

function dataFilePath(app) {
  return path.join(app.getPath('userData'), 'countdowns.json')
}

function normalizeCountdowns(value) {
  if (!Array.isArray(value)) return []

  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      id: String(item.id || Date.now()),
      name: String(item.name || '未命名事件'),
      targetTime: Number(item.targetTime || Date.now()),
      startTime: Number(item.startTime || Date.now()),
      city: String(item.city || '')
    }))
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

module.exports = { loadCountdowns, saveCountdowns, importCountdowns, exportCountdowns }
