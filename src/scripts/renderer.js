// IPC Renderer
const { ipcRenderer } = require('electron');

// Update Status Event 
// Changes the text on the footer div to show the current app update progress.
ipcRenderer.on('updatestatus', (event, text) => {
    document.getElementById('footer').innerHTML = text;
});
