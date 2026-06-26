const LEGACY_STORAGE_KEY = 'countdownList';
const DEFAULT_REMINDERS = [1440, 60, 10];
const VALID_CATEGORIES = new Set(['birthday', 'work', 'exam', 'travel', 'anniversary', 'custom']);

function normalizeReminderMinutes(value) {
    if (!Array.isArray(value)) return DEFAULT_REMINDERS;

    return [...new Set(value.map(Number))]
        .filter((minutes) => Number.isFinite(minutes) && minutes >= 0)
        .sort((a, b) => b - a);
}

function normalizeCountdowns(value) {
    if (!Array.isArray(value)) return [];

    return value
        .filter((item) => item && typeof item === 'object')
        .map((item) => {
            const now = Date.now();
            const targetTime = Number(item.targetTime || now);
            const startTime = Number(item.startTime || item.createdAt || now);
            const category = VALID_CATEGORIES.has(item.category) ? item.category : 'custom';

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
            };
        })
        .filter((item) => Number.isFinite(item.targetTime) && Number.isFinite(item.startTime));
}

function loadLegacyCountdowns() {
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!stored) return [];

    try {
        return normalizeCountdowns(JSON.parse(stored));
    } catch (_error) {
        return [];
    }
}

async function loadCountdowns() {
    const countdowns = normalizeCountdowns(await window.countdownAPI.loadCountdowns());
    if (countdowns.length > 0) return countdowns;

    const legacyCountdowns = loadLegacyCountdowns();
    if (legacyCountdowns.length > 0) {
        await saveCountdowns(legacyCountdowns);
    }
    return legacyCountdowns;
}

function saveCountdowns(countdowns) {
    return window.countdownAPI.saveCountdowns(normalizeCountdowns(countdowns));
}

function exportCountdowns(countdowns) {
    return window.countdownAPI.exportCountdowns(normalizeCountdowns(countdowns));
}

async function importCountdowns() {
    const result = await window.countdownAPI.importCountdowns();
    if (result.canceled) return result;
    return { ...result, countdowns: normalizeCountdowns(result.countdowns) };
}

function exportIcs(countdowns) {
    return window.countdownAPI.exportIcs(normalizeCountdowns(countdowns));
}

async function importIcs() {
    const result = await window.countdownAPI.importIcs();
    if (result.canceled) return result;
    return { ...result, countdowns: normalizeCountdowns(result.countdowns) };
}

export {
    DEFAULT_REMINDERS,
    normalizeCountdowns,
    loadCountdowns,
    saveCountdowns,
    exportCountdowns,
    importCountdowns,
    exportIcs,
    importIcs
};
