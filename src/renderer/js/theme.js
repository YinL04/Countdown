const THEME_STORAGE_KEY = 'appTheme';
const DEFAULT_THEME = 'modern';

function initTheme(themeSelector) {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
    document.documentElement.dataset.theme = savedTheme;
    themeSelector.value = savedTheme;

    themeSelector.addEventListener('change', (event) => {
        const theme = event.target.value;
        document.documentElement.dataset.theme = theme;
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    });
}

module.exports = { initTheme };
