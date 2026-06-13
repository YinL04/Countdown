const { execFile } = require('child_process');
const path = require('path');

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
    const showWeatherPanel = () => {
        elements.weatherPanel.classList.remove('hidden');
        elements.weatherContent.classList.add('hidden');
        elements.weatherLoading.classList.remove('hidden');
        elements.weatherError.classList.add('hidden');
    };

    const hideWeatherPanel = () => {
        elements.weatherPanel.classList.add('hidden');
    };

    const renderWeather = (data) => {
        elements.weatherLoading.classList.add('hidden');
        elements.weatherContent.classList.remove('hidden');

        setSummary(elements.weatherSummary, data.summary);
        setList(elements.weatherTips, data.tips);
        setList(elements.weatherAttractions, data.attractions);
    };

    const showWeatherError = (message) => {
        elements.weatherLoading.classList.add('hidden');
        elements.weatherContent.classList.add('hidden');
        elements.weatherError.classList.remove('hidden');
        elements.weatherError.textContent = message;
    };

    const fetchWeather = (city) => {
        showWeatherPanel();
        elements.weatherCityLabel.textContent = city;
        elements.weatherPanelTitle.textContent = `${city} - 天气出行建议`;

        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

        execFile(pythonCmd, ['-m', 'weather_agent', city], {
            cwd: path.join(__dirname, '..', '..', '..'),
            timeout: 15000,
            encoding: 'utf-8',
            env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
        }, (error, stdout, stderr) => {
            if (error) {
                if (error.killed) {
                    showWeatherError('天气查询超时，请稍后重试。');
                } else if (error.code === 'ENOENT') {
                    showWeatherError('未找到 Python 环境，请确保已安装 Python 并添加到系统 PATH。');
                } else {
                    showWeatherError(`天气查询失败：${stderr || error.message}`);
                }
                return;
            }

            const text = stdout.trim();
            if (!text) {
                showWeatherError('天气查询返回为空，请稍后重试。');
                return;
            }

            try {
                const data = JSON.parse(text);
                if (data.error) {
                    showWeatherError(`天气查询出错：${data.error}`);
                    return;
                }
                renderWeather(data);
            } catch (parseError) {
                showWeatherError('天气数据解析失败，请稍后重试。');
            }
        });
    };

    elements.closeWeatherBtn.addEventListener('click', hideWeatherPanel);

    return { fetchWeather, hideWeatherPanel };
}

module.exports = { createWeatherPanel };
