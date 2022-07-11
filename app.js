// Libraries
// Electron
const { app, BrowserWindow } = require('electron');
// Electron Updater
const { autoUpdater } = require('electron-updater');
// Electron Custom Titlebar
const { setupTitlebar, attachTitlebarToWindow } = require('custom-electron-titlebar/main');
// Path
const path = require("path");

// Main Window
let mainWindow;

// Title Bar
setupTitlebar();

// App Ready
app.on('ready', () => {
    // Create Main Window
    createWindow();

    // App HTML Loaded
    mainWindow.webContents.on('did-finish-load', () => {
        // Show Loaded Window
        mainWindow.show();

        // Check For Updates
        autoUpdater.checkForUpdatesAndNotify();
    });
});


// App Closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Send Update Status to Renderer
function sendStatusToWindow(text) {
    mainWindow.webContents.send('message', text);
}

// Create Window Function
const createWindow = () => {
    // Main Window
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 800,
        minHeight: 600,
        frame: false,
        title: `GeoEXIF ${app.getVersion()}`,
        icon: __dirname + '/src/images/icon.ico',
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    mainWindow.loadFile('./src/index.html');
    attachTitlebarToWindow(mainWindow);
}

// App Update Events
autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded');
});