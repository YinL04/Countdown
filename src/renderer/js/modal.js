function toDateTimeLocalValue(timestamp) {
    const date = new Date(timestamp);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
}

function createEventModal({ elements, getCountdowns, setCountdowns, onSave }) {
    const closeModal = () => {
        elements.modalOverlay.classList.add('hidden');
    };

    const openModal = (editData = null, defaults = {}) => {
        if (editData) {
            elements.modalTitle.textContent = '编辑倒计时';
            elements.eventNameInput.value = editData.name;
            elements.eventTimeInput.value = toDateTimeLocalValue(editData.targetTime);
            elements.eventCityInput.value = editData.city || '';
            elements.editingEventId.value = editData.id;
        } else {
            elements.modalTitle.textContent = '添加倒计时';
            elements.eventNameInput.value = '';

            const date = defaults.date ? new Date(defaults.date) : new Date();
            if (!defaults.date) date.setDate(date.getDate() + 1);
            if (defaults.date && date.getHours() === 0 && date.getMinutes() === 0) {
                date.setHours(9, 0, 0, 0);
            }
            elements.eventTimeInput.value = toDateTimeLocalValue(date.getTime());

            elements.eventCityInput.value = '';
            elements.editingEventId.value = '';
        }

        elements.modalOverlay.classList.remove('hidden');
    };

    const saveEvent = () => {
        const name = elements.eventNameInput.value.trim() || '未命名事件';
        const timeStr = elements.eventTimeInput.value;
        if (!timeStr) {
            alert('请选择目标时间！');
            return;
        }

        const city = elements.eventCityInput.value.trim();
        const selectedDate = new Date(timeStr).getTime();
        const editingId = elements.editingEventId.value;
        const countdowns = [...getCountdowns()];

        if (editingId) {
            const index = countdowns.findIndex((countdown) => countdown.id === editingId);
            if (index > -1) {
                countdowns[index] = {
                    ...countdowns[index],
                    name,
                    targetTime: selectedDate,
                    city
                };
            }
        } else {
            countdowns.push({
                id: Date.now().toString(),
                name,
                targetTime: selectedDate,
                startTime: Date.now(),
                city
            });
        }

        setCountdowns(countdowns);
        onSave();
        closeModal();
    };

    elements.addBtn.addEventListener('click', () => openModal(null));
    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.saveBtn.addEventListener('click', saveEvent);

    return { openModal, closeModal };
}

export { createEventModal };
