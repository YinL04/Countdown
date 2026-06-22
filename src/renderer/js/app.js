import { getDomElements } from './dom.js';
import { loadCountdowns, saveCountdowns, exportCountdowns, importCountdowns } from './storage.js';
import { initTheme } from './theme.js';
import { createCountdownRenderer } from './countdown.js';
import { createEventModal } from './modal.js';
import { createWeatherPanel } from './weather.js';
import { createCalendar } from './calendar.js';

async function initApp() {
    const elements = getDomElements();
    let countdowns = await loadCountdowns();

    const getCountdowns = () => countdowns;
    const setCountdowns = (nextCountdowns) => {
        countdowns = nextCountdowns;
    };

    initTheme(elements.themeSelector);

    const weatherPanel = createWeatherPanel(elements);
    let renderCards = () => {};
    let renderCalendar = () => {};

    const persistAndRender = async () => {
        await saveCountdowns(countdowns);
        renderCards();
        renderCalendar();
    };

    const eventModal = createEventModal({
        elements,
        getCountdowns,
        setCountdowns,
        onSave: persistAndRender
    });

    const countdownRenderer = createCountdownRenderer({
        elements,
        getCountdowns,
        setCountdowns,
        onEdit: eventModal.openModal,
        onWeather: weatherPanel.fetchWeather,
        onChange: persistAndRender
    });
    renderCards = countdownRenderer.renderCards;

    const calendar = createCalendar({
        elements,
        getCountdowns,
        onEdit: eventModal.openModal,
        onCreate: (date) => eventModal.openModal(null, { date })
    });
    renderCalendar = calendar.renderCalendar;

    elements.exportBtn.addEventListener('click', async () => {
        const result = await exportCountdowns(countdowns);
        if (!result.canceled) alert('导出完成。');
    });

    elements.importBtn.addEventListener('click', async () => {
        const result = await importCountdowns();
        if (result.canceled) return;
        setCountdowns(result.countdowns);
        await persistAndRender();
        alert('导入完成。');
    });

    renderCards();
}

export { initApp };
