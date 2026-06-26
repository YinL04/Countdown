import { formatTime, updateAnimate } from './time.js';
import { categoryMeta, eventStatus, formatDateTime, reminderSummary } from './events.js';

function createCountdownRenderer({
    elements,
    getCountdowns,
    getVisibleCountdowns,
    setCountdowns,
    onEdit,
    onRestart,
    onWeather,
    onChange
}) {
    let globalTimer = null;

    const updateAllClocks = () => {
        const now = Date.now();

        document.querySelectorAll('.countdown-card').forEach((cardEl) => {
            const data = getCountdowns().find((countdown) => countdown.id === cardEl.dataset.id);
            if (!data) return;

            const distance = data.targetTime - now;
            const isPast = distance <= 0;
            const absDistance = Math.abs(distance);
            const progressEl = cardEl.querySelector('.progress-bar');

            cardEl.classList.toggle('is-past', isPast);
            cardEl.classList.toggle('is-archived', data.archived);

            if (isPast || data.archived) {
                progressEl.style.width = '100%';
            } else {
                const totalDuration = data.targetTime - data.startTime;
                const currentProgress = totalDuration > 0 ? 100 - (distance / totalDuration * 100) : 100;
                progressEl.style.width = `${Math.max(0, Math.min(100, currentProgress))}%`;
            }

            const days = Math.floor(absDistance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((absDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((absDistance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((absDistance % (1000 * 60)) / 1000);

            updateAnimate(cardEl.querySelector('.days'), formatTime(days));
            updateAnimate(cardEl.querySelector('.hours'), formatTime(hours));
            updateAnimate(cardEl.querySelector('.minutes'), formatTime(minutes));
            updateAnimate(cardEl.querySelector('.seconds'), formatTime(seconds));
        });
    };

    const updateEvent = async (id, updater) => {
        setCountdowns(getCountdowns().map((event) => event.id === id ? updater(event) : event));
        await onChange();
    };

    const deleteEvent = async (item) => {
        if (!confirm(`确定删除“${item.name}”吗？此操作不能撤销。`)) return;
        setCountdowns(getCountdowns().filter((countdown) => countdown.id !== item.id));
        await onChange();
    };

    const renderCards = () => {
        const visibleCountdowns = getVisibleCountdowns();
        elements.cardsContainer.innerHTML = '';

        if (visibleCountdowns.length === 0) {
            elements.emptyState.classList.remove('hidden');
        } else {
            elements.emptyState.classList.add('hidden');

            visibleCountdowns.forEach((item) => {
                const clone = elements.cardTemplate.content.cloneNode(true);
                const cardEl = clone.querySelector('.countdown-card');
                const status = eventStatus(item);
                const category = categoryMeta(item.category);

                cardEl.dataset.id = item.id;
                cardEl.classList.add(`status-${status}`);
                clone.querySelector('.card-title').textContent = item.name;
                clone.querySelector('.card-category').textContent = category.mark;
                clone.querySelector('.card-category').title = category.label;
                clone.querySelector('.target-date').textContent = `${category.label} · ${formatDateTime(item.targetTime)}`;
                clone.querySelector('.reminder-label').textContent = reminderSummary(item.reminderMinutes);

                const notesEl = clone.querySelector('.card-notes');
                if (item.notes) {
                    notesEl.textContent = item.notes;
                    notesEl.classList.remove('hidden');
                }

                const cityLabel = clone.querySelector('.card-city');
                const weatherBtn = clone.querySelector('.weather-btn');
                if (item.city && item.city.trim()) {
                    cityLabel.textContent = item.city;
                    cityLabel.classList.remove('hidden');
                    weatherBtn.classList.remove('hidden');
                    weatherBtn.addEventListener('click', () => onWeather(item));
                }

                const archiveBtn = clone.querySelector('.archive-btn');
                archiveBtn.textContent = item.archived ? '恢复' : '归档';
                archiveBtn.title = item.archived ? '恢复到未归档' : '归档记录';
                archiveBtn.addEventListener('click', () => updateEvent(item.id, (event) => ({
                    ...event,
                    archived: !event.archived,
                    archivedAt: event.archived ? null : Date.now()
                })));

                const restartBtn = clone.querySelector('.restart-btn');
                if (item.targetTime <= Date.now()) {
                    restartBtn.classList.remove('hidden');
                    restartBtn.addEventListener('click', () => onRestart(item));
                }

                clone.querySelector('.edit-btn').addEventListener('click', () => onEdit(item));
                clone.querySelector('.delete-btn').addEventListener('click', () => deleteEvent(item));

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
