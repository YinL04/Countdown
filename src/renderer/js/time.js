function formatTime(value) {
    return value < 10 ? `0${value}` : value;
}

function updateAnimate(element, newValue) {
    if (element.textContent === newValue) return;

    element.textContent = newValue;
    element.style.transform = 'scale(1.15)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 150);
}

export { formatTime, updateAnimate };
