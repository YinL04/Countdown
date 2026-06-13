const path = require('path');

const { initApp } = require(path.join(__dirname, 'js', 'app.js'));

document.addEventListener('DOMContentLoaded', initApp);
