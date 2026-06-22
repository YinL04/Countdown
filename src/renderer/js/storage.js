const LEGACY_STORAGE_KEY = 'countdownList';

function normalizeCountdowns(value) {
    if (!Array.isArray(value)) return [];

    return value
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
            id: String(item.id || Date.now()),
            name: String(item.name || '未命名事件'),
            targetTime: Number(item.targetTime || Date.now()),
            startTime: Number(item.startTime || Date.now()),
            city: String(item.city || '')
        }))
        .filter((item) => Number.isFinite(item.targetTime) && Number.isFinite(item.startTime));
}

function loadLegacyCountdowns() {
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!stored) return [];

    try {
        return normalizeCountdowns(JSON.parse(stored));
    } catch (error) {
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

export { loadCountdowns, saveCountdowns, exportCountdowns, importCountdowns, normalizeCountdowns };
