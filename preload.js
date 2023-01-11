// Electron Custom Titlebar
const { Titlebar, Color } = require('custom-electron-titlebar');
// App Version Information
const appVersion = require('./package.json').version;

// HTML File has been Loaded
window.addEventListener('DOMContentLoaded', () => {
    // Title bar implemenation
    new Titlebar({
        iconSize: 20,
        backgroundColor: Color.fromHex('#1e2124')
    });

    // Bottom Left Status Bar
    var statusBar = document.getElementById('bottomRightStatusBar');
    statusBar.innerHTML = `Made with ❤️ from Lithuania | GEOEXIF ${appVersion}`;
});