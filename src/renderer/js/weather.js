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

function createWeatherPanel(elements) {
    const cache = new Map();
    let activeCity = '';

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

    const renderWeather = (data, city, fromCache = false) => {
        elements.weatherLoading.classList.add('hidden');
        elements.weatherContent.classList.remove('hidden');
        elements.weatherError.classList.add('hidden');

        setSummary(elements.weatherSummary, data.summary);
        setList(elements.weatherTips, data.tips);
        setList(elements.weatherAttractions, data.attractions);

        const updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
        elements.weatherMeta.classList.remove('hidden');
        elements.weatherMeta.textContent = `${city} · ${fromCache ? '上次结果' : '刚刚更新'} · ${updatedAt.toLocaleString()}`;
    };

    const showWeatherError = (message) => {
        elements.weatherLoading.classList.add('hidden');
        elements.weatherError.classList.remove('hidden');
        elements.weatherError.textContent = message;
    };

    const fetchWeather = async (city, { force = false } = {}) => {
        activeCity = city;
        showWeatherPanel();
        elements.weatherCityLabel.textContent = city;
        elements.weatherPanelTitle.textContent = `${city} - 天气出行建议`;

        if (!force && cache.has(city)) {
            renderWeather(cache.get(city), city, true);
            return;
        }

        const data = await window.countdownAPI.fetchWeather(city);
        if (data.error) {
            if (cache.has(city)) {
                renderWeather(cache.get(city), city, true);
                showWeatherError(`${data.error} 已保留上一次结果。`);
                return;
            }
            elements.weatherContent.classList.add('hidden');
            showWeatherError(data.error);
            return;
        }

        const enriched = { ...data, updatedAt: new Date().toISOString() };
        cache.set(city, enriched);
        renderWeather(enriched, city);
    };

    elements.closeWeatherBtn.addEventListener('click', hideWeatherPanel);
    elements.refreshWeatherBtn.addEventListener('click', () => {
        if (activeCity) fetchWeather(activeCity, { force: true });
    });

    return { fetchWeather, hideWeatherPanel };
}

export { createWeatherPanel };
