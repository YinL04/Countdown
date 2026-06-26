import { getDomElements } from './dom.js';
import {
    loadCountdowns,
    saveCountdowns,
    exportCountdowns,
    importCountdowns,
    exportIcs,
    importIcs,
    normalizeCountdowns
} from './storage.js';
import { initTheme } from './theme.js';
import { createCountdownRenderer } from './countdown.js';
import { createEventModal } from './modal.js';
import { createWeatherPanel } from './weather.js';
import { createCalendar } from './calendar.js';
import { categoryMeta, eventStatus, formatShortDateTime, distanceLabel, isSameDay } from './events.js';

const LAST_BACKUP_KEY = 'lastCountdownBackupAt';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

async function showError(message, title = '操作失败') {
    if (window.countdownAPI?.showError) {
        await window.countdownAPI.showError(title, message);
    } else {
        alert(`${title}\n${message}`);
    }
}

async function showMessage(message, title = '提示') {
    if (window.countdownAPI?.showMessage) {
        await window.countdownAPI.showMessage(title, message);
    } else {
        alert(message);
    }
}

function mergeImportedCountdowns(current, imported) {
    const usedIds = new Set(current.map((event) => event.id));
    const additions = imported.map((event, index) => {
        if (!usedIds.has(event.id)) {
            usedIds.add(event.id);
            return event;
        }

        const nextId = `${event.id}-${Date.now()}-${index}`;
        usedIds.add(nextId);
        return { ...event, id: nextId };
    });

    return [...current, ...additions];
}

function makeMiniEvent(container, event, onOpen) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mini-event';
    const category = categoryMeta(event.category);
    button.innerHTML = `
        <span class="mini-event-mark">${category.mark}</span>
        <span class="mini-event-main">
            <strong></strong>
            <small></small>
        </span>
    `;
    button.querySelector('strong').textContent = event.name;
    button.querySelector('small').textContent = `${formatShortDateTime(event.targetTime)} · ${distanceLabel(event)}`;
    button.addEventListener('click', () => onOpen(event));
    container.appendChild(button);
}

async function initApp() {
    const elements = getDomElements();
    let countdowns = [];
    const uiState = {
        search: '',
        category: 'all',
        status: 'active',
        sort: 'time-asc'
    };

    try {
        countdowns = normalizeCountdowns(await loadCountdowns());
    } catch (error) {
        await showError(`读取本地数据失败：${error.message}`);
        countdowns = [];
    }

    const getCountdowns = () => countdowns;
    const setCountdowns = (nextCountdowns) => {
        countdowns = normalizeCountdowns(nextCountdowns);
    };

    const getVisibleCountdowns = () => {
        const query = uiState.search.trim().toLowerCase();

        return [...countdowns]
            .filter((event) => {
                const category = categoryMeta(event.category).label;
                const haystack = `${event.name} ${event.city} ${event.notes} ${category}`.toLowerCase();
                if (query && !haystack.includes(query)) return false;
                if (uiState.category !== 'all' && event.category !== uiState.category) return false;

                const status = eventStatus(event);
                if (uiState.status === 'active') return !event.archived;
                if (uiState.status === 'all') return true;
                return status === uiState.status;
            })
            .sort((a, b) => {
                if (uiState.sort === 'time-desc') return b.targetTime - a.targetTime;
                if (uiState.sort === 'created-desc') return b.createdAt - a.createdAt;
                if (uiState.sort === 'category') {
                    const byCategory = categoryMeta(a.category).label.localeCompare(categoryMeta(b.category).label, 'zh-CN');
                    return byCategory || a.targetTime - b.targetTime;
                }
                return a.targetTime - b.targetTime;
            });
    };

    initTheme(elements.themeSelector);

    const weatherPanel = createWeatherPanel(elements);
    let renderCards = () => {};
    let renderCalendar = () => {};

    const renderBackupBanner = () => {
        if (countdowns.length === 0) {
            elements.backupBanner.classList.add('hidden');
            return;
        }

        const lastBackupAt = Number(localStorage.getItem(LAST_BACKUP_KEY) || 0);
        const shouldShow = !lastBackupAt || Date.now() - lastBackupAt > WEEK_MS;
        elements.backupBanner.classList.toggle('hidden', !shouldShow);
        if (shouldShow && lastBackupAt) {
            elements.backupMessage.textContent = `上次备份是 ${new Date(lastBackupAt).toLocaleString('zh-CN')}，建议现在导出一次。`;
        } else {
            elements.backupMessage.textContent = '你的重要日期只保存在本机，定期备份更安心。';
        }
    };

    const renderOverview = () => {
        const activeEvents = countdowns.filter((event) => !event.archived);
        const todayEvents = activeEvents
            .filter((event) => isSameDay(new Date(event.targetTime), new Date()))
            .sort((a, b) => a.targetTime - b.targetTime);
        const upcomingEvents = activeEvents
            .filter((event) => event.targetTime > Date.now())
            .sort((a, b) => a.targetTime - b.targetTime)
            .slice(0, 4);

        elements.todayList.innerHTML = '';
        elements.upcomingList.innerHTML = '';
        elements.todayCount.textContent = todayEvents.length;
        elements.upcomingCount.textContent = upcomingEvents.length;

        if (todayEvents.length === 0) {
            elements.todayList.innerHTML = '<p class="mini-empty">今天没有事件。</p>';
        } else {
            todayEvents.forEach((event) => makeMiniEvent(elements.todayList, event, eventModal.openModal));
        }

        if (upcomingEvents.length === 0) {
            elements.upcomingList.innerHTML = '<p class="mini-empty">暂无未来事件。</p>';
        } else {
            upcomingEvents.forEach((event) => makeMiniEvent(elements.upcomingList, event, eventModal.openModal));
        }
    };

    const renderAll = () => {
        renderCards();
        renderCalendar();
        renderOverview();
        renderBackupBanner();
    };

    const persistAndRender = async () => {
        try {
            await saveCountdowns(countdowns);
            renderAll();
        } catch (error) {
            await showError(`保存本地数据失败：${error.message}`);
        }
    };

    const eventModal = createEventModal({
        elements,
        getCountdowns,
        setCountdowns,
        onSave: persistAndRender,
        onError: (message) => showError(message, '无法保存')
    });

    const countdownRenderer = createCountdownRenderer({
        elements,
        getCountdowns,
        getVisibleCountdowns,
        setCountdowns,
        onEdit: eventModal.openModal,
        onRestart: (event) => eventModal.openModal(event, { restart: true }),
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

    const runExport = async () => {
        try {
            const result = await exportCountdowns(countdowns);
            if (!result.canceled) {
                localStorage.setItem(LAST_BACKUP_KEY, String(Date.now()));
                renderBackupBanner();
                await showMessage('导出完成。');
            }
        } catch (error) {
            await showError(`导出失败：${error.message}`);
        }
    };

    elements.exportBtn.addEventListener('click', runExport);
    elements.backupNowBtn.addEventListener('click', runExport);

    elements.importBtn.addEventListener('click', async () => {
        try {
            const result = await importCountdowns();
            if (result.canceled) return;
            if (countdowns.length > 0 && !confirm('导入 JSON 备份会替换当前列表，确定继续吗？')) return;
            setCountdowns(result.countdowns);
            await persistAndRender();
            await showMessage('导入完成。');
        } catch (error) {
            await showError(`导入失败：${error.message}`);
        }
    });

    elements.exportIcsBtn.addEventListener('click', async () => {
        try {
            const result = await exportIcs(countdowns);
            if (!result.canceled) await showMessage('日历文件导出完成。');
        } catch (error) {
            await showError(`导出日历失败：${error.message}`);
        }
    });

    elements.importIcsBtn.addEventListener('click', async () => {
        try {
            const result = await importIcs();
            if (result.canceled) return;
            setCountdowns(mergeImportedCountdowns(countdowns, result.countdowns));
            await persistAndRender();
            await showMessage(`已导入 ${result.countdowns.length} 个日历事件。`);
        } catch (error) {
            await showError(`导入日历失败：${error.message}`);
        }
    });

    elements.miniWindowBtn.addEventListener('click', async () => {
        const result = await window.countdownAPI.toggleMiniWindow();
        if (result?.ok) {
            elements.miniWindowBtn.textContent = result.isMiniWindow ? '退出小窗' : '小窗';
        }
    });

    elements.searchInput.addEventListener('input', (event) => {
        uiState.search = event.target.value;
        renderCards();
    });
    elements.categoryFilter.addEventListener('change', (event) => {
        uiState.category = event.target.value;
        renderCards();
    });
    elements.statusFilter.addEventListener('change', (event) => {
        uiState.status = event.target.value;
        renderCards();
    });
    elements.sortSelect.addEventListener('change', (event) => {
        uiState.sort = event.target.value;
        renderCards();
    });

    renderAll();
}

export { initApp };
