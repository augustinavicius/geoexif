# GEOEXIF

A fast, lightweight desktop app for viewing GPS EXIF metadata from images on an interactive map.

## Features

- Load JPEG/PNG images and plot their GPS coordinates on a Leaflet map
- Multiple map layers: OpenStreetMap, Google Street, Terrain, Hybrid, Satellite, GPS Traces overlay
- Select images individually, all at once, or by radius from a point (haversine distance)
- Export loaded image data to Excel (.xlsx)
- Auto-update via GitHub Releases

## Stack

- [Electron](https://www.electronjs.org/) 42
- [Leaflet](https://leafletjs.com/) 1.9
- [Bulma](https://bulma.io/) CSS
- [fast-exif](https://www.npmjs.com/package/fast-exif) for EXIF reading
- [xlsx](https://www.npmjs.com/package/xlsx) for Excel export
- [electron-updater](https://www.electron.build/auto-update) for auto-updates

## Development

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

**Rebuild CSS** (after editing `styledefs.scss`):

```bash
npm run build-sass
```

## Build

```bash
# Build installer (no publish)
npm run build-app

# Build and publish to GitHub Releases
npm run deploy-app
```

Releases are published to GitHub via `electron-builder`. A `GH_TOKEN` environment variable with repo write access is required for `deploy-app`.

## Architecture

The app follows the modern Electron security model:

- **Main process** (`app.js`) — handles all Node.js I/O: file dialogs, EXIF reading, Excel export, shell operations. Exposes these via `ipcMain.handle` channels.
- **Preload** (`preload.js`) — bridges main and renderer using `contextBridge`, exposing `window.electronAPI`. Also initialises the custom titlebar.
- **Renderer** (`src/scripts/renderer.js`) — pure browser JS. No `require()`. Consumes `window.electronAPI` for all IPC and the `L` global for Leaflet.

`nodeIntegration` is disabled and `contextIsolation` is enabled.

## License

MIT
