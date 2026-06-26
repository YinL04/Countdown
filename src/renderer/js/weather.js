import { distanceLabel, formatDateTime } from './events.js';

function setList(container, items) {
    container.innerHTML = '';

    if (!items || items.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'weather-empty';
        empty.textContent = '暂无数据';
        container.appendChild(empty);
        return;
    }

    items.forEach((item) => {
        const row = document.createElement('p');
        row.className = 'weather-item';
        row.textContent = item;
        container.appendChild(row);
    });
}

function setSummary(container, summary) {
    container.innerHTML = '';
    const paragraph = document.createElement('p');
    paragraph.className = summary ? '' : 'weather-empty';
    paragraph.textContent = summary || '暂无数据';
    container.appendChild(paragraph);
}

function eventWeatherHint(event) {
    const distance = event.targetTime - Date.now();
    if (distance < 0) return '事件已过去，以下天气仅供回顾或重新规划参考。';
    if (distance <= 7 * 86400000) return '事件临近，可以把天气建议直接作为出行准备清单。';
    return '事件还比较远，天气可能变化较大，建议临近一周再刷新确认。';
}

function createWeatherPanel(elements) {
    const cache = new Map();
    let activeEvent = null;

    const showWeatherPanel = () => {
        elements.weatherPanel.classList.remove('hidden');
        elements.weatherContent.classList.add('hidden');
        elements.weatherLoading.classList.remove('hidden');
        elements.weatherError.classList.add('hidden');
        elements.refreshWeatherBtn.classList.remove('hidden');
    };

    const hideWeatherPanel = () => {
        elements.weatherPanel.classList.add('hidden');
    };

    const renderContext = (event) => {
        if (!event) {
            elements.weatherContext.classList.add('hidden');
            elements.weatherContext.textContent = '';
            return;
        }

        elements.weatherContext.classList.remove('hidden');
        elements.weatherContext.textContent = `${event.name} · ${formatDateTime(event.targetTime)} · ${distanceLabel(event)}。${eventWeatherHint(event)}`;
    };

    const renderWeather = (data, event, fromCache = false) => {
        elements.weatherLoading.classList.add('hidden');
        elements.weatherContent.classList.remove('hidden');
        elements.weatherError.classList.add('hidden');

        setSummary(elements.weatherSummary, data.summary);
        setList(elements.weatherTips, data.tips);
        setList(elements.weatherAttractions, data.attractions);
        renderContext(event);

        const updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
        elements.weatherMeta.classList.remove('hidden');
        elements.weatherMeta.textContent = `${event.city} · ${fromCache ? '上次结果' : '刚刚更新'} · ${updatedAt.toLocaleString('zh-CN')}`;
    };

    const showWeatherError = (message) => {
        elements.weatherLoading.classList.add('hidden');
        elements.weatherError.classList.remove('hidden');
        elements.weatherError.textContent = message;
    };

    const fetchWeather = async (event, { force = false } = {}) => {
        if (!event || !event.city) return;
        activeEvent = event;
        showWeatherPanel();
        elements.weatherCityLabel.textContent = event.city;
        elements.weatherPanelTitle.textContent = `${event.name} · ${event.city} 出行建议`;
        renderContext(event);

        const cacheKey = `${event.city}:${event.targetTime}`;
        if (!force && cache.has(cacheKey)) {
            renderWeather(cache.get(cacheKey), event, true);
            return;
        }

        const data = await window.countdownAPI.fetchWeather(event.city, {
            eventName: event.name,
            targetTime: event.targetTime
        });
        if (data.error) {
            if (cache.has(cacheKey)) {
                renderWeather(cache.get(cacheKey), event, true);
                showWeatherError(`${data.error} 已保留上一次结果。`);
                return;
            }
            elements.weatherContent.classList.add('hidden');
            showWeatherError(data.error);
            return;
        }

        const enriched = { ...data, updatedAt: new Date().toISOString() };
        cache.set(cacheKey, enriched);
        renderWeather(enriched, event);
    };

    elements.closeWeatherBtn.addEventListener('click', hideWeatherPanel);
    elements.refreshWeatherBtn.addEventListener('click', () => {
        if (activeEvent) fetchWeather(activeEvent, { force: true });
    });

    return { fetchWeather, hideWeatherPanel };
}

export { createWeatherPanel };
