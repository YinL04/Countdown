function getDomElements() {
    return {
        cardsContainer: document.getElementById('cards-container'),
        emptyState: document.getElementById('empty-state'),
        themeSelector: document.getElementById('theme-selector'),
        addBtn: document.getElementById('add-new-btn'),
        modalOverlay: document.getElementById('modal-overlay'),
        closeModalBtn: document.getElementById('close-modal'),
        saveBtn: document.getElementById('save-btn'),
        modalTitle: document.getElementById('modal-title'),
        openCalendarBtn: document.getElementById('open-calendar-btn'),
        calendarOverlay: document.getElementById('calendar-overlay'),
        closeCalendarBtn: document.getElementById('close-calendar'),
        calDaysGrid: document.getElementById('cal-days-grid'),
        calMonthYear: document.getElementById('cal-month-year'),
        calPrev: document.getElementById('cal-prev'),
        calNext: document.getElementById('cal-next'),
        eventNameInput: document.getElementById('event-name'),
        eventTimeInput: document.getElementById('event-time'),
        eventCityInput: document.getElementById('event-city'),
        editingEventId: document.getElementById('editing-event-id'),
        cardTemplate: document.getElementById('card-template'),
        weatherPanel: document.getElementById('weather-panel'),
        weatherPanelTitle: document.getElementById('weather-panel-title'),
        weatherCityLabel: document.getElementById('weather-city-label'),
        closeWeatherBtn: document.getElementById('close-weather'),
        weatherContent: document.getElementById('weather-content'),
        weatherSummary: document.getElementById('weather-summary'),
        weatherTips: document.getElementById('weather-tips'),
        weatherAttractions: document.getElementById('weather-attractions'),
        weatherLoading: document.getElementById('weather-loading'),
        weatherError: document.getElementById('weather-error')
    };
}

module.exports = { getDomElements };
