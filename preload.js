const { Titlebar, Color } = require('custom-electron-titlebar');

window.addEventListener('DOMContentLoaded', () => {
    // Title bar implemenation
    new Titlebar({
        iconSize: 20,
        backgroundColor: Color.fromHex('#1e2124')
    });
});