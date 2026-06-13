const STORAGE_KEY = 'countdownList';

function loadCountdowns() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    try {
        return JSON.parse(stored);
    } catch (error) {
        return [];
    }
}

function saveCountdowns(countdowns) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(countdowns));
}

module.exports = { loadCountdowns, saveCountdowns };
