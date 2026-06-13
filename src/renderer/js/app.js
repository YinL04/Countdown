const { getDomElements } = require('./dom');
const { loadCountdowns, saveCountdowns } = require('./storage');
const { initTheme } = require('./theme');
const { createCountdownRenderer } = require('./countdown');
const { createEventModal } = require('./modal');
const { createWeatherPanel } = require('./weather');
const { createCalendar } = require('./calendar');

function initApp() {
    const elements = getDomElements();
    let countdowns = loadCountdowns();

    const getCountdowns = () => countdowns;
    const setCountdowns = (nextCountdowns) => {
        countdowns = nextCountdowns;
    };

    initTheme(elements.themeSelector);

    const weatherPanel = createWeatherPanel(elements);
    let renderCards = () => {};
    let renderCalendar = () => {};

    const persistAndRender = () => {
        saveCountdowns(countdowns);
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

    const calendar = createCalendar({ elements, getCountdowns });
    renderCalendar = calendar.renderCalendar;

    renderCards();
}

module.exports = { initApp };
