import { DEFAULT_REMINDERS } from './storage.js';

function toDateTimeLocalValue(timestamp) {
    const date = new Date(timestamp);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
}

function selectedReminders(elements) {
    return Array.from(elements.reminderOptions)
        .filter((input) => input.checked)
        .map((input) => Number(input.value))
        .filter((minutes) => Number.isFinite(minutes))
        .sort((a, b) => b - a);
}

function setReminderOptions(elements, values) {
    const selected = new Set(values || DEFAULT_REMINDERS);
    elements.reminderOptions.forEach((input) => {
        input.checked = selected.has(Number(input.value));
    });
}

function createEventModal({ elements, getCountdowns, setCountdowns, onSave, onError }) {
    const closeModal = () => {
        elements.modalOverlay.classList.add('hidden');
    };

    const openModal = (editData = null, defaults = {}) => {
        if (editData) {
            elements.modalTitle.textContent = defaults.restart ? '重新设置倒计时' : '编辑倒计时';
            elements.eventNameInput.value = editData.name;
            elements.eventCategoryInput.value = editData.category || 'custom';
            elements.eventCityInput.value = editData.city || '';
            elements.eventNotesInput.value = editData.notes || '';
            elements.editingEventId.value = editData.id;
            setReminderOptions(elements, editData.reminderMinutes);

            if (defaults.restart) {
                const date = new Date();
                date.setDate(date.getDate() + 1);
                date.setHours(9, 0, 0, 0);
                elements.eventTimeInput.value = toDateTimeLocalValue(date.getTime());
            } else {
                elements.eventTimeInput.value = toDateTimeLocalValue(editData.targetTime);
            }
        } else {
            elements.modalTitle.textContent = '添加倒计时';
            elements.eventNameInput.value = '';
            elements.eventCategoryInput.value = defaults.category || 'custom';

            const date = defaults.date ? new Date(defaults.date) : new Date();
            if (!defaults.date) date.setDate(date.getDate() + 1);
            if (defaults.date && date.getHours() === 0 && date.getMinutes() === 0) {
                date.setHours(9, 0, 0, 0);
            }
            elements.eventTimeInput.value = toDateTimeLocalValue(date.getTime());

            elements.eventCityInput.value = '';
            elements.eventNotesInput.value = '';
            elements.editingEventId.value = '';
            setReminderOptions(elements, DEFAULT_REMINDERS);
        }

        elements.modalOverlay.classList.remove('hidden');
        elements.eventNameInput.focus();
    };

    const saveEvent = async () => {
        const name = elements.eventNameInput.value.trim() || '未命名事件';
        const timeStr = elements.eventTimeInput.value;
        if (!timeStr) {
            await onError('请先选择目标时间。');
            return;
        }

        const selectedDate = new Date(timeStr).getTime();
        if (!Number.isFinite(selectedDate)) {
            await onError('目标时间格式无效，请重新选择。');
            return;
        }

        const city = elements.eventCityInput.value.trim();
        const notes = elements.eventNotesInput.value.trim();
        const category = elements.eventCategoryInput.value || 'custom';
        const reminderMinutes = selectedReminders(elements);
        const editingId = elements.editingEventId.value;
        const countdowns = [...getCountdowns()];

        if (editingId) {
            const index = countdowns.findIndex((countdown) => countdown.id === editingId);
            if (index > -1) {
                countdowns[index] = {
                    ...countdowns[index],
                    name,
                    targetTime: selectedDate,
                    city,
                    category,
                    notes,
                    reminderMinutes,
                    archived: false,
                    archivedAt: null
                };
            }
        } else {
            countdowns.push({
                id: `${Date.now()}`,
                name,
                targetTime: selectedDate,
                startTime: Date.now(),
                createdAt: Date.now(),
                city,
                category,
                notes,
                reminderMinutes,
                archived: false,
                archivedAt: null
            });
        }

        setCountdowns(countdowns);
        await onSave();
        closeModal();
    };

    elements.addBtn.addEventListener('click', () => openModal(null));
    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.saveBtn.addEventListener('click', saveEvent);
    elements.modalOverlay.addEventListener('click', (event) => {
        if (event.target === elements.modalOverlay) closeModal();
    });

    return { openModal, closeModal };
}

export { createEventModal };
