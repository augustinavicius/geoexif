// Electron Custom Titlebar
const { Titlebar, Color } = require('custom-electron-titlebar');
// App Version Information
const appVersion = require('./package.json').version;

// HTML File has been Loaded
window.addEventListener('DOMContentLoaded', () => {
    // Title bar implemenation
    let titlebar = new Titlebar({
        iconSize: 20,
        backgroundColor: Color.fromHex('#1e2124')
    });

    titlebar.updateTitle(`GEOEXIF ${appVersion}`);
});