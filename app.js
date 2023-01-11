// Electron
const { app, BrowserWindow, Menu } = require('electron');
// Electron Remote
const remote = require('@electron/remote/main');
remote.initialize();
// Electron Updater
const { autoUpdater } = require('electron-updater');
// Electron Custom Titlebar
const { setupTitlebar, attachTitlebarToWindow } = require('custom-electron-titlebar/main');
// ENV
require('dotenv').config();
// File Paths
const path = require('path');

// Main Window
var window;
// Custom Titlebar Setup
setupTitlebar();

// App Loaded
app.on('ready', () => {
    // Window
    window = new BrowserWindow({
        width: 900,
        minWidth: 900,
        height: 600,
        minHeight: 600,
        frame: false, // False because a custom titlebar (frame) will be used
        icon: __dirname + '/src/images/icon.ico',
        show: false, // Do not show before fully loaded
        webPreferences: {
            nodeIntegration: true, // Required for node modules to work
            contextIsolation: false, // Remove security policy of script isolation, since it makes work easier and there is no need for advanced security in this app
            preload: path.join(__dirname, 'preload.js') // Used for titlebar and update status bar communication
        }
    });
    // Developer Tools (open developer tools on startup, if .env is configured to do so)
    if (process.env.DEV == 'true') window.webContents.openDevTools();

    // Attach index.html File to the window
    window.loadFile('./src/index.html');

    // Remote used for save/open dialogs on Windows machines
    remote.enable(window.webContents);

    // Custom Titlebar Menu Template (save & open items)
    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Import',
                    submenu: [
                        {
                            label: 'Import JSON (NOT IMPLEMENTED)',
                            click: () => { window.webContents.send('menuItemImportJSON') }
                        },
                        {
                            label: 'Import Excel (NOT IMPLEMENTED)',
                            click: () => { window.webContents.send('menuItemImportExcel') }
                        },
                    ]
                },
                {
                    label: 'Export',
                    submenu: [
                        {
                            label: 'Export JSON (NOT IMPLEMENTED)',
                            click: () => { window.webContents.send('menuItemExportJSON') }
                        },
                        {
                            label: 'Export Excel',
                            click: () => { window.webContents.send('menuItemExportExcel') }
                        },
                    ]
                }
            ]
        },
        {
            label: 'About',
            click: async () => {
                const { shell } = require('electron');
                await shell.openExternal('https://github.com/augustinavicius/geoexif');
            }
        }
    ]

    // Build menu from template
    const menu = Menu.buildFromTemplate(menuTemplate);

    // Load menu
    Menu.setApplicationMenu(menu);

    // Custom Titlebar
    attachTitlebarToWindow(window);

    // Finish Window Load
    window.webContents.on('did-finish-load', () => {
        // Finally show the window
        window.show();

        // Immediately check for updates & provide status (events)
        autoUpdater.checkForUpdatesAndNotify();
    });
});

// App Closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit(); // Proper app close
});

// App Updater Communications with renderer process
function sendStatusToWindow(text) {
    window.webContents.send('updateStatus', text);
}

// App Updater Notifcations
autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for an update...');
})
autoUpdater.on('update-available', () => {
    sendStatusToWindow('Update found.');
})
autoUpdater.on('update-not-available', () => {
    sendStatusToWindow('Update not found.');
})
autoUpdater.on('error', (err) => {
    sendStatusToWindow('An error has occured: ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', () => {
    sendStatusToWindow('Update downloaded');
});