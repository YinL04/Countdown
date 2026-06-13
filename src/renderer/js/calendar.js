function createCalendar({ elements, getCountdowns }) {
    let calDate = new Date();

    const renderCalendar = () => {
        elements.calDaysGrid.innerHTML = '';
        const year = calDate.getFullYear();
        const month = calDate.getMonth();
        elements.calMonthYear.textContent = `${year}年${month + 1}月`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'cal-day empty';
            elements.calDaysGrid.appendChild(emptyDiv);
        }

        const today = new Date();

        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'cal-day';
            dayDiv.textContent = day;

            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayDiv.classList.add('today');
            }

            const dayEvents = getCountdowns().filter((countdown) => {
                const date = new Date(countdown.targetTime);
                return date.getDate() === day && date.getMonth() === month && date.getFullYear() === year;
            });

            if (dayEvents.length > 0) {
                dayDiv.classList.add('has-event');
            }

            dayDiv.addEventListener('click', () => {
                if (dayEvents.length > 0) {
                    const eventList = dayEvents.map((event) => {
                        const date = new Date(event.targetTime);
                        const cityInfo = event.city ? ` [${event.city}]` : '';
                        const hour = date.getHours().toString().padStart(2, '0');
                        const minute = date.getMinutes().toString().padStart(2, '0');
                        return `• ${event.name}${cityInfo} (${hour}:${minute})`;
                    }).join('\n');
                    alert(`${year}年${month + 1}月${day}日的事件：\n\n${eventList}`);
                } else {
                    alert(`${year}年${month + 1}月${day}日 当前没有倒计时记录。`);
                }
            });

            elements.calDaysGrid.appendChild(dayDiv);
        }
    };

    elements.openCalendarBtn.addEventListener('click', () => {
        renderCalendar();
        elements.calendarOverlay.classList.remove('hidden');
    });

    elements.closeCalendarBtn.addEventListener('click', () => {
        elements.calendarOverlay.classList.add('hidden');
    });

    elements.calPrev.addEventListener('click', () => {
        calDate.setMonth(calDate.getMonth() - 1);
        renderCalendar();
    });

    elements.calNext.addEventListener('click', () => {
        calDate.setMonth(calDate.getMonth() + 1);
        renderCalendar();
    });

    return { renderCalendar };
}

module.exports = { createCalendar };
