// IPC Renderer
const { ipcRenderer } = require('electron');

ipcRenderer.on('message', (event, text) => {
    document.getElementById('footer').innerHTML = text;
});