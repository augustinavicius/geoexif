const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const { setupTitlebar, attachTitlebarToWindow } = require('custom-electron-titlebar/main');
const path = require('path');
const EXIF = require('fast-exif');
const xlsx = require('xlsx');

require('dotenv').config();
setupTitlebar();

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 900,
        minWidth: 900,
        height: 600,
        minHeight: 600,
        frame: false,
        icon: path.join(__dirname, 'src/images/icon.ico'),
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false, // required for custom-electron-titlebar in preload
            preload: path.join(__dirname, 'preload.js')
        }
    });

    if (process.env.DEV === 'true') mainWindow.webContents.openDevTools();

    mainWindow.loadFile('./src/index.html');

    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Export',
                    submenu: [
                        {
                            label: 'Export Excel',
                            click: () => { mainWindow.webContents.send('menuItemExportExcel') }
                        }
                    ]
                }
            ]
        },
        {
            label: 'About',
            click: async () => { await shell.openExternal('https://github.com/augustinavicius/geoexif') }
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    attachTitlebarToWindow(mainWindow);

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.show();
        autoUpdater.checkForUpdatesAndNotify();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// ---- IPC Handlers ----

ipcMain.handle('dialog:openImages', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'Images', extensions: ['jpg', 'png', 'jpeg'] }]
    });
    return result.canceled ? [] : result.filePaths;
});

ipcMain.handle('exif:read', async (_event, imagePath) => {
    try {
        const data = await EXIF.read(imagePath);
        return { success: true, data, basename: path.basename(imagePath) };
    } catch (error) {
        return { success: false, error: error.message, basename: path.basename(imagePath) };
    }
});

ipcMain.handle('shell:openPath', async (_event, filePath) => {
    await shell.openPath(filePath);
});

ipcMain.handle('excel:save', async (_event, imageData) => {
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
        filters: [{ name: 'Excel file', extensions: ['xlsx'] }]
    });
    if (canceled || !filePath) return;

    const rows = imageData.map(img => ({
        Name: img.name,
        Path: img.path,
        EXIF: img.exif,
        GPS: img.gps,
        Latitude: img.latitude,
        Longitude: img.longitude
    }));

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(rows);
    for (let i = 0; i < imageData.length; i++) {
        worksheet[`A${i + 2}`].l = { Target: `file://${imageData[i].path}` };
    }
    xlsx.utils.book_append_sheet(workbook, worksheet, 'data');
    xlsx.writeFile(workbook, filePath);
});

// ---- Auto Updater ----

function sendStatusToWindow(text) {
    mainWindow.webContents.send('updateStatus', text);
}

autoUpdater.on('checking-for-update', () => { sendStatusToWindow('Checking for an update...') });
autoUpdater.on('update-available', () => { sendStatusToWindow('Update found.') });
autoUpdater.on('update-not-available', () => { sendStatusToWindow('Update not found.') });
autoUpdater.on('error', err => { sendStatusToWindow(`An error has occurred: ${err}`) });
autoUpdater.on('download-progress', p => {
    sendStatusToWindow(`Download speed: ${p.bytesPerSecond} - Downloaded ${p.percent}% (${p.transferred}/${p.total})`);
});
autoUpdater.on('update-downloaded', () => { sendStatusToWindow('Update downloaded') });
