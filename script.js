document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const cardsContainer = document.getElementById('cards-container');
    const emptyState = document.getElementById('empty-state');
    const addBtn = document.getElementById('add-new-btn');
    const modalOverlay = document.getElementById('modal-overlay');
    const closeModalBtn = document.getElementById('close-modal');
    const saveBtn = document.getElementById('save-btn');
    
    const eventNameInput = document.getElementById('event-name');
    const eventTimeInput = document.getElementById('event-time');
    
    const cardTemplate = document.getElementById('card-template');

    // State
    let countdowns = [];
    let globalTimer = null;

    // Default time in modal
    const setDefaultTime = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const localTomorrow = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000);
        eventTimeInput.value = localTomorrow.toISOString().slice(0, 19);
    };

    // Load Data
    const loadData = () => {
        const stored = localStorage.getItem('countdownList');
        if (stored) {
            try {
                countdowns = JSON.parse(stored);
                // Optionally filter out very old ones or keep them. We will keep them.
            } catch (e) {
                console.error("Failed to parse data", e);
                countdowns = [];
            }
        }
        renderCards();
    };

    const saveData = () => {
        localStorage.setItem('countdownList', JSON.stringify(countdowns));
        renderCards();
    };

    // Render logic
    const renderCards = () => {
        cardsContainer.innerHTML = '';
        
        if (countdowns.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            
            // Sort by target time ascending
            const sortedCountdowns = [...countdowns].sort((a, b) => a.targetTime - b.targetTime);
            
            sortedCountdowns.forEach(item => {
                const clone = cardTemplate.content.cloneNode(true);
                const cardEl = clone.querySelector('.countdown-card');
                
                cardEl.dataset.id = item.id;
                clone.querySelector('.card-title').textContent = item.name;
                
                // Add Delete Listener
                clone.querySelector('.delete-btn').addEventListener('click', () => {
                    if(confirm(`确定要删除 "${item.name}" 记录吗？`)) {
                        countdowns = countdowns.filter(c => c.id !== item.id);
                        saveData();
                    }
                });

                cardsContainer.appendChild(clone);
            });
        }

        // Restart timer loop
        if (globalTimer) clearInterval(globalTimer);
        updateAllClocks(); // sync immediately
        if (countdowns.length > 0) {
            globalTimer = setInterval(updateAllClocks, 1000);
        }
    };

    // Global ticking function
    const updateAllClocks = () => {
        const now = new Date().getTime();
        
        const cardElements = document.querySelectorAll('.countdown-card');
        cardElements.forEach(cardEl => {
            const id = cardEl.dataset.id;
            const data = countdowns.find(c => c.id === id);
            if (!data) return;

            const distance = data.targetTime - now;
            
            const daysEl = cardEl.querySelector('.days');
            const hoursEl = cardEl.querySelector('.hours');
            const minutesEl = cardEl.querySelector('.minutes');
            const secondsEl = cardEl.querySelector('.seconds');
            const progressEl = cardEl.querySelector('.progress-bar');
            const titleEl = cardEl.querySelector('.card-title');

            if (distance <= 0) {
                daysEl.textContent = '00';
                hoursEl.textContent = '00';
                minutesEl.textContent = '00';
                secondsEl.textContent = '00';
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

            // Progress bar
            const totalDuration = data.targetTime - data.startTime;
            let currentProg = 0;
            if (totalDuration > 0) {
                currentProg = 100 - (distance / totalDuration * 100);
            } else {
                currentProg = 100;
            }
            
            currentProg = Math.max(0, Math.min(100, currentProg));
            progressEl.style.width = `${currentProg}%`;
        });
    };

    const updateAnimate = (element, newValue) => {
        if (element.textContent !== newValue) {
            element.textContent = newValue;
            element.style.transform = 'scale(1.15)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 150);
        }
    };

    const formatTime = (time) => time < 10 ? `0${time}` : time;

    // Modal Interaction
    addBtn.addEventListener('click', () => {
        setDefaultTime();
        eventNameInput.value = '';
        modalOverlay.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
    });

    saveBtn.addEventListener('click', () => {
        const name = eventNameInput.value.trim() || '未命名事件';
        const timeStr = eventTimeInput.value;

        if (!timeStr) {
            alert('请选择目标时间！');
            return;
        }

        const selectedDate = new Date(timeStr).getTime();
        const now = new Date().getTime();

        if (selectedDate <= now) {
            alert('请选择一个未来的时间！');
            return;
        }

        const newRecord = {
            id: Date.now().toString(),
            name,
            targetTime: selectedDate,
            startTime: now
        };

        countdowns.push(newRecord);
        saveData();
        modalOverlay.classList.add('hidden');
    });

    // Initialize
    loadData();
});
