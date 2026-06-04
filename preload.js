const { contextBridge, ipcRenderer } = require('electron');
const { createTitlebarOnDOMContentLoaded, TitlebarColor } = require('custom-electron-titlebar');
const appVersion = require('./package.json').version;

contextBridge.exposeInMainWorld('electronAPI', {
    openImages:     ()            => ipcRenderer.invoke('dialog:openImages'),
    readExif:       (imagePath)   => ipcRenderer.invoke('exif:read', imagePath),
    openPath:       (filePath)    => ipcRenderer.invoke('shell:openPath', filePath),
    saveExcel:      (imageData)   => ipcRenderer.invoke('excel:save', imageData),
    onUpdateStatus: (callback)    => { ipcRenderer.on('updateStatus', (_e, text) => callback(text)) },
    onExportExcel:  (callback)    => { ipcRenderer.on('menuItemExportExcel', () => callback()) },
});

createTitlebarOnDOMContentLoaded({
    iconSize: 20,
    backgroundColor: TitlebarColor.fromHex('#1e2124')
});

window.addEventListener('DOMContentLoaded', () => {
    const statusBar = document.getElementById('bottomRightStatusBar');
    if (statusBar) statusBar.innerHTML = `Made with ❤️ from Lithuania | GEOEXIF ${appVersion}`;
});
