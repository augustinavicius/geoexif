const { Titlebar, Color } = require('custom-electron-titlebar');
const package = require('./package.json');

window.addEventListener('DOMContentLoaded', () => {
    // Title bar implemenation
    let titlebar = new Titlebar({
        iconSize: 20,
        backgroundColor: Color.fromHex('#1e2124')
    });

    titlebar.updateTitle(`GEOEXIF ${package.version}`);
});