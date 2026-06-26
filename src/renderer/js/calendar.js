import { categoryMeta, eventStatus, isSameDay } from './events.js';

const DAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function startOfDay(date) {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
}

function addDays(date, amount) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
}

function formatDate(date) {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatTime(date) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function createCalendar({ elements, getCountdowns, onEdit, onCreate }) {
    let anchorDate = new Date();
    let viewMode = 'month';
    let filterMode = 'all';

    const getFilteredEvents = () => {
        const today = new Date();
        return [...getCountdowns()]
            .filter((event) => {
                const date = new Date(event.targetTime);
                if (filterMode !== 'all' && event.archived) return false;
                if (filterMode === 'upcoming') return event.targetTime > Date.now();
                if (filterMode === 'past') return event.targetTime <= Date.now();
                if (filterMode === 'today') return isSameDay(date, today);
                if (filterMode === 'with-city') return Boolean(event.city && event.city.trim());
                return !event.archived;
            })
            .sort((a, b) => a.targetTime - b.targetTime);
    };

    const eventsOnDay = (date) => getFilteredEvents().filter((event) => isSameDay(new Date(event.targetTime), date));

    const createEventPill = (event, compact = false) => {
        const button = document.createElement('button');
        const category = categoryMeta(event.category);
        button.className = `calendar-event ${eventStatus(event)}${compact ? ' compact' : ''}`;
        button.type = 'button';
        button.title = event.name;
        const date = new Date(event.targetTime);
        button.textContent = compact ? `${category.mark} ${event.name}` : `${formatTime(date)} · ${category.label} · ${event.name}`;
        button.addEventListener('click', (clickEvent) => {
            clickEvent.stopPropagation();
            onEdit(event);
        });
        return button;
    };

    const createEmptyState = (text) => {
        const empty = document.createElement('div');
        empty.className = 'calendar-empty';
        empty.textContent = text;
        return empty;
    };

    const setActiveViewButton = () => {
        elements.calendarViewBtns.forEach((button) => {
            button.classList.toggle('active', button.dataset.view === viewMode);
        });
    };

    const renderSummary = () => {
        const all = getCountdowns();
        const active = all.filter((event) => !event.archived);
        const visible = getFilteredEvents();
        const upcoming = active.filter((event) => event.targetTime > Date.now()).length;
        const past = active.length - upcoming;
        elements.calendarSummary.textContent = `共 ${active.length} 个未归档事件 · 未来 ${upcoming} 个 · 已过去 ${past} 个 · 当前显示 ${visible.length} 个`;
    };

    const renderMonth = () => {
        const year = anchorDate.getFullYear();
        const month = anchorDate.getMonth();
        elements.calMonthYear.textContent = `${year}年${month + 1}月`;
        elements.calendarSubtitle.textContent = '月视图展示事件标题，点击空白日期可快速新建事件。';

        const grid = document.createElement('div');
        grid.className = 'calendar-month-grid';

        DAY_NAMES.forEach((name) => {
            const weekday = document.createElement('div');
            weekday.className = 'calendar-weekday';
            weekday.textContent = name;
            grid.appendChild(weekday);
        });

        const first = new Date(year, month, 1);
        const start = addDays(first, -first.getDay());
        const today = new Date();

        for (let index = 0; index < 42; index++) {
            const date = addDays(start, index);
            const dayEvents = eventsOnDay(date);
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'calendar-day-cell';
            if (date.getMonth() !== month) cell.classList.add('outside-month');
            if (isSameDay(date, today)) cell.classList.add('today');

            const dayNumber = document.createElement('span');
            dayNumber.className = 'calendar-day-number';
            dayNumber.textContent = date.getDate();
            cell.appendChild(dayNumber);

            const list = document.createElement('div');
            list.className = 'calendar-day-events';
            dayEvents.slice(0, 3).forEach((event) => list.appendChild(createEventPill(event, true)));
            if (dayEvents.length > 3) {
                const more = document.createElement('span');
                more.className = 'calendar-more';
                more.textContent = `+${dayEvents.length - 3}`;
                list.appendChild(more);
            }
            cell.appendChild(list);

            cell.addEventListener('click', () => onCreate(startOfDay(date)));
            grid.appendChild(cell);
        }

        elements.calendarView.replaceChildren(grid);
    };

    const renderRangeList = (days, title) => {
        elements.calMonthYear.textContent = title;
        elements.calendarSubtitle.textContent = viewMode === 'week'
            ? '周视图按日期拆分事件，适合安排一周节奏。'
            : '日视图聚焦当天事件，适合快速编辑和补充。';

        const wrapper = document.createElement('div');
        wrapper.className = 'calendar-agenda';

        let hasEvents = false;
        days.forEach((date) => {
            const dayEvents = eventsOnDay(date);
            const section = document.createElement('section');
            section.className = 'agenda-day';

            const header = document.createElement('button');
            header.className = 'agenda-day-header';
            header.type = 'button';
            header.textContent = `${formatDate(date)} ${DAY_NAMES[date.getDay()]}`;
            header.addEventListener('click', () => onCreate(startOfDay(date)));
            section.appendChild(header);

            if (dayEvents.length === 0) {
                section.appendChild(createEmptyState('当天没有事件，点击日期可新建。'));
            } else {
                hasEvents = true;
                dayEvents.forEach((event) => section.appendChild(createEventPill(event)));
            }

            wrapper.appendChild(section);
        });

        if (!hasEvents && filterMode !== 'all') {
            wrapper.prepend(createEmptyState('当前筛选条件下没有事件。'));
        }

        elements.calendarView.replaceChildren(wrapper);
    };

    const renderWeek = () => {
        const start = addDays(startOfDay(anchorDate), -anchorDate.getDay());
        const days = Array.from({ length: 7 }, (_item, index) => addDays(start, index));
        const end = days[6];
        renderRangeList(days, `${formatDate(start)} - ${formatDate(end)}`);
    };

    const renderDay = () => {
        renderRangeList([startOfDay(anchorDate)], formatDate(anchorDate));
    };

    const renderCalendar = () => {
        setActiveViewButton();
        renderSummary();

        if (viewMode === 'month') renderMonth();
        if (viewMode === 'week') renderWeek();
        if (viewMode === 'day') renderDay();
    };

    const moveAnchor = (amount) => {
        if (viewMode === 'month') {
            anchorDate.setMonth(anchorDate.getMonth() + amount);
        } else if (viewMode === 'week') {
            anchorDate = addDays(anchorDate, amount * 7);
        } else {
            anchorDate = addDays(anchorDate, amount);
        }
        renderCalendar();
    };

    elements.openCalendarBtn.addEventListener('click', () => {
        renderCalendar();
        elements.calendarOverlay.classList.remove('hidden');
    });

    elements.closeCalendarBtn.addEventListener('click', () => {
        elements.calendarOverlay.classList.add('hidden');
    });

    elements.calendarOverlay.addEventListener('click', (event) => {
        if (event.target === elements.calendarOverlay) elements.calendarOverlay.classList.add('hidden');
    });

    elements.calPrev.addEventListener('click', () => moveAnchor(-1));
    elements.calNext.addEventListener('click', () => moveAnchor(1));
    elements.calToday.addEventListener('click', () => {
        anchorDate = new Date();
        renderCalendar();
    });

    elements.calendarViewBtns.forEach((button) => {
        button.addEventListener('click', () => {
            viewMode = button.dataset.view;
            renderCalendar();
        });
    });

    elements.calendarFilter.addEventListener('change', (event) => {
        filterMode = event.target.value;
        renderCalendar();
    });

    elements.calendarAddBtn.addEventListener('click', () => {
        onCreate(startOfDay(anchorDate));
    });

    return { renderCalendar };
}

export { createCalendar };
