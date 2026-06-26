const CATEGORIES = {
    birthday: { label: '生日', mark: '生' },
    work: { label: '项目', mark: '项' },
    exam: { label: '考试', mark: '考' },
    travel: { label: '旅行', mark: '旅' },
    anniversary: { label: '纪念日', mark: '纪' },
    custom: { label: '其他', mark: '其' }
};

function categoryMeta(category) {
    return CATEGORIES[category] || CATEGORIES.custom;
}

function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}

function eventStatus(event, now = Date.now()) {
    if (event.archived) return 'archived';
    if (event.targetTime <= now) return 'past';
    if (isSameDay(new Date(event.targetTime), new Date(now))) return 'today';
    return 'upcoming';
}

function formatDateTime(timestamp) {
    return new Date(timestamp).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatShortDateTime(timestamp) {
    return new Date(timestamp).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatReminder(minutes) {
    if (minutes >= 1440) return `提前 ${Math.round(minutes / 1440)} 天`;
    if (minutes >= 60) return `提前 ${Math.round(minutes / 60)} 小时`;
    if (minutes > 0) return `提前 ${minutes} 分钟`;
    return '准时';
}

function reminderSummary(reminderMinutes) {
    if (!Array.isArray(reminderMinutes) || reminderMinutes.length === 0) return '不提醒';
    return reminderMinutes.map(formatReminder).join(' / ');
}

function distanceLabel(event, now = Date.now()) {
    const distance = event.targetTime - now;
    const abs = Math.abs(distance);
    const days = Math.floor(abs / 86400000);
    const hours = Math.floor((abs % 86400000) / 3600000);
    const minutes = Math.floor((abs % 3600000) / 60000);
    const prefix = distance >= 0 ? '还有' : '已过去';

    if (days > 0) return `${prefix} ${days} 天 ${hours} 小时`;
    if (hours > 0) return `${prefix} ${hours} 小时 ${minutes} 分钟`;
    return `${prefix} ${minutes} 分钟`;
}

export {
    CATEGORIES,
    categoryMeta,
    isSameDay,
    eventStatus,
    formatDateTime,
    formatShortDateTime,
    reminderSummary,
    distanceLabel
};
