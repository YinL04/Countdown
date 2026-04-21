document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const cardsContainer = document.getElementById('cards-container');
    const emptyState = document.getElementById('empty-state');
    
    // Theme
    const themeSelector = document.getElementById('theme-selector');
    
    // Modals
    const addBtn = document.getElementById('add-new-btn');
    const modalOverlay = document.getElementById('modal-overlay');
    const closeModalBtn = document.getElementById('close-modal');
    const saveBtn = document.getElementById('save-btn');
    const modalTitle = document.getElementById('modal-title');
    
    // Calendar
    const openCalendarBtn = document.getElementById('open-calendar-btn');
    const calendarOverlay = document.getElementById('calendar-overlay');
    const closeCalendarBtn = document.getElementById('close-calendar');
    const calDaysGrid = document.getElementById('cal-days-grid');
    const calMonthYear = document.getElementById('cal-month-year');
    const calPrev = document.getElementById('cal-prev');
    const calNext = document.getElementById('cal-next');
    
    // Inputs
    const eventNameInput = document.getElementById('event-name');
    const eventTimeInput = document.getElementById('event-time');
    const editingEventId = document.getElementById('editing-event-id');
    
    const cardTemplate = document.getElementById('card-template');

    // --- State ---
    let countdowns = [];
    let globalTimer = null;
    let calDate = new Date(); // To track calendar month view

    // --- Theme Manager ---
    const loadTheme = () => {
        const savedTheme = localStorage.getItem('appTheme') || 'modern';
        document.documentElement.dataset.theme = savedTheme;
        themeSelector.value = savedTheme;
    };
    
    themeSelector.addEventListener('change', (e) => {
        const theme = e.target.value;
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('appTheme', theme);
    });

    // --- Data Manager ---
    const loadData = () => {
        const stored = localStorage.getItem('countdownList');
        if (stored) {
            try { countdowns = JSON.parse(stored); } catch (e) { countdowns = []; }
        }
        renderCards();
    };

    const saveData = () => {
        localStorage.setItem('countdownList', JSON.stringify(countdowns));
        renderCards();
        renderCalendar(); // Sync calendar dots
    };

    // --- Core Render Logic ---
    const renderCards = () => {
        cardsContainer.innerHTML = '';
        if (countdowns.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            const sorted = [...countdowns].sort((a, b) => a.targetTime - b.targetTime);
            
            sorted.forEach(item => {
                const clone = cardTemplate.content.cloneNode(true);
                const cardEl = clone.querySelector('.countdown-card');
                cardEl.dataset.id = item.id;
                clone.querySelector('.card-title').textContent = item.name;
                
                // Edit Listener
                clone.querySelector('.edit-btn').addEventListener('click', () => {
                    openModal(item);
                });
                
                // Delete Listener
                clone.querySelector('.delete-btn').addEventListener('click', () => {
                    if(confirm(`确定要删除 "${item.name}" 记录吗？`)) {
                        countdowns = countdowns.filter(c => c.id !== item.id);
                        saveData();
                    }
                });

                cardsContainer.appendChild(clone);
            });
        }

        if (globalTimer) clearInterval(globalTimer);
        updateAllClocks(); // sync immediately
        if (countdowns.length > 0) globalTimer = setInterval(updateAllClocks, 1000);
    };

    const updateAllClocks = () => {
        const now = new Date().getTime();
        document.querySelectorAll('.countdown-card').forEach(cardEl => {
            const data = countdowns.find(c => c.id === cardEl.dataset.id);
            if (!data) return;
            const distance = data.targetTime - now;

            const daysEl = cardEl.querySelector('.days');
            const hoursEl = cardEl.querySelector('.hours');
            const minutesEl = cardEl.querySelector('.minutes');
            const secondsEl = cardEl.querySelector('.seconds');
            const progressEl = cardEl.querySelector('.progress-bar');
            const titleEl = cardEl.querySelector('.card-title');

            if (distance <= 0) {
                [daysEl, hoursEl, minutesEl, secondsEl].forEach(el => el.textContent = '00');
                progressEl.style.width = '100%';
                if (!titleEl.textContent.includes('已结束')) {
                    titleEl.textContent = data.name + ' (已结束)';
                }
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            updateAnimate(daysEl, formatTime(days));
            updateAnimate(hoursEl, formatTime(hours));
            updateAnimate(minutesEl, formatTime(minutes));
            updateAnimate(secondsEl, formatTime(seconds));

            const totalDuration = data.targetTime - data.startTime;
            let currentProg = totalDuration > 0 ? 100 - (distance / totalDuration * 100) : 100;
            progressEl.style.width = `${Math.max(0, Math.min(100, currentProg))}%`;
        });
    };

    const updateAnimate = (element, newValue) => {
        if (element.textContent !== newValue) {
            element.textContent = newValue;
            element.style.transform = 'scale(1.15)';
            setTimeout(() => element.style.transform = 'scale(1)', 150);
        }
    };
    const formatTime = (t) => t < 10 ? `0${t}` : t;

    // --- Modal Logic ---
    const openModal = (editData = null) => {
        if (editData) {
            modalTitle.textContent = '编辑倒计时';
            eventNameInput.value = editData.name;
            const d = new Date(editData.targetTime);
            eventTimeInput.value = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,19);
            editingEventId.value = editData.id;
        } else {
            modalTitle.textContent = '添加倒计时';
            eventNameInput.value = '';
            const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
            eventTimeInput.value = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
            editingEventId.value = '';
        }
        modalOverlay.classList.remove('hidden');
    };

    addBtn.addEventListener('click', () => openModal(null));
    closeModalBtn.addEventListener('click', () => modalOverlay.classList.add('hidden'));

    saveBtn.addEventListener('click', () => {
        const name = eventNameInput.value.trim() || '未命名事件';
        const timeStr = eventTimeInput.value;
        if (!timeStr) return alert('请选择目标时间！');

        const selectedDate = new Date(timeStr).getTime();
        const now = new Date().getTime();
        if (selectedDate <= now) return alert('请选择一个未来的时间！');

        const eId = editingEventId.value;
        if (eId) {
            const idx = countdowns.findIndex(c => c.id === eId);
            if (idx > -1) {
                countdowns[idx].name = name;
                countdowns[idx].targetTime = selectedDate;
                // keep original startTime
            }
        } else {
            countdowns.push({
                id: Date.now().toString(),
                name,
                targetTime: selectedDate,
                startTime: now
            });
        }
        
        saveData();
        modalOverlay.classList.add('hidden');
    });

    // --- Calendar Module ---
    const renderCalendar = () => {
        calDaysGrid.innerHTML = '';
        const year = calDate.getFullYear();
        const month = calDate.getMonth();
        calMonthYear.textContent = `${year}年 ${month + 1}月`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Pad empty days
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'cal-day empty';
            calDaysGrid.appendChild(emptyDiv);
        }

        const today = new Date();
        
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'cal-day';
            dayDiv.textContent = i;
            
            // Highlight today
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayDiv.classList.add('today');
            }

            // Check if any event falls on this date
            const dayEvents = countdowns.filter(c => {
                const d = new Date(c.targetTime);
                return d.getDate() === i && d.getMonth() === month && d.getFullYear() === year;
            });
            
            if (dayEvents.length > 0) {
                dayDiv.classList.add('has-event');
            }

            // Click listener to display events
            dayDiv.addEventListener('click', () => {
                if (dayEvents.length > 0) {
                    const eventList = dayEvents.map(e => {
                        const d = new Date(e.targetTime);
                        return `• ${e.name} (${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')})`;
                    }).join('\n');
                    alert(`📅 ${year}年${month + 1}月${i}日的事件：\n\n${eventList}`);
                } else {
                    alert(`📅 ${year}年${month + 1}月${i}日 当前没有倒计时记录。`);
                }
            });

            calDaysGrid.appendChild(dayDiv);
        }
    };

    openCalendarBtn.addEventListener('click', () => {
        renderCalendar();
        calendarOverlay.classList.remove('hidden');
    });
    
    closeCalendarBtn.addEventListener('click', () => calendarOverlay.classList.add('hidden'));
    
    calPrev.addEventListener('click', () => {
        calDate.setMonth(calDate.getMonth() - 1);
        renderCalendar();
    });
    
    calNext.addEventListener('click', () => {
        calDate.setMonth(calDate.getMonth() + 1);
        renderCalendar();
    });

    // --- Boot ---
    loadTheme();
    loadData();
});
