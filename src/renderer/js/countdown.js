import { formatTime, updateAnimate } from './time.js';

function createCountdownRenderer({ elements, getCountdowns, setCountdowns, onEdit, onWeather, onChange }) {
    let globalTimer = null;

    const updateAllClocks = () => {
        const now = Date.now();

        document.querySelectorAll('.countdown-card').forEach((cardEl) => {
            const data = getCountdowns().find((countdown) => countdown.id === cardEl.dataset.id);
            if (!data) return;

            const distance = data.targetTime - now;
            const isPast = distance <= 0;
            const absDistance = Math.abs(distance);

            const daysEl = cardEl.querySelector('.days');
            const hoursEl = cardEl.querySelector('.hours');
            const minutesEl = cardEl.querySelector('.minutes');
            const secondsEl = cardEl.querySelector('.seconds');
            const progressEl = cardEl.querySelector('.progress-bar');
            const titleEl = cardEl.querySelector('.card-title');

            if (isPast) {
                if (!titleEl.textContent.includes('已过去')) {
                    titleEl.textContent = `${data.name} (已过去)`;
                }
                progressEl.style.width = '100%';
            } else {
                if (titleEl.textContent.includes('已过去')) {
                    titleEl.textContent = data.name;
                }

                const totalDuration = data.targetTime - data.startTime;
                const currentProgress = totalDuration > 0 ? 100 - (distance / totalDuration * 100) : 100;
                progressEl.style.width = `${Math.max(0, Math.min(100, currentProgress))}%`;
            }

            const days = Math.floor(absDistance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((absDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((absDistance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((absDistance % (1000 * 60)) / 1000);

            updateAnimate(daysEl, formatTime(days));
            updateAnimate(hoursEl, formatTime(hours));
            updateAnimate(minutesEl, formatTime(minutes));
            updateAnimate(secondsEl, formatTime(seconds));
        });
    };

    const renderCards = () => {
        const countdowns = getCountdowns();
        elements.cardsContainer.innerHTML = '';

        if (countdowns.length === 0) {
            elements.emptyState.classList.remove('hidden');
        } else {
            elements.emptyState.classList.add('hidden');

            [...countdowns]
                .sort((a, b) => a.targetTime - b.targetTime)
                .forEach((item) => {
                    const clone = elements.cardTemplate.content.cloneNode(true);
                    const cardEl = clone.querySelector('.countdown-card');
                    cardEl.dataset.id = item.id;
                    clone.querySelector('.card-title').textContent = item.name;

                    const cityLabel = clone.querySelector('.card-city');
                    const weatherBtn = clone.querySelector('.weather-btn');
                    if (item.city && item.city.trim()) {
                        cityLabel.textContent = item.city;
                        cityLabel.classList.remove('hidden');
                        weatherBtn.classList.remove('hidden');
                        weatherBtn.addEventListener('click', () => onWeather(item.city.trim()));
                    }

                    clone.querySelector('.edit-btn').addEventListener('click', () => onEdit(item));
                    clone.querySelector('.delete-btn').addEventListener('click', () => {
                        if (confirm(`确定要删除 "${item.name}" 记录吗？`)) {
                            setCountdowns(countdowns.filter((countdown) => countdown.id !== item.id));
                            onChange();
                        }
                    });

                    elements.cardsContainer.appendChild(clone);
                });
        }

        if (globalTimer) clearInterval(globalTimer);
        updateAllClocks();
        if (getCountdowns().length > 0) {
            globalTimer = setInterval(updateAllClocks, 1000);
        }
    };

    return { renderCards, updateAllClocks };
}

export { createCountdownRenderer };
