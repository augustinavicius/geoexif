// Renderer process — no Node.js. Uses window.electronAPI (contextBridge) and the L global (Leaflet).

// ---- State ----

let map;
let markerIcon;
let selectedMarkerIcon;
let loadedImages = [];
let loadedMarkers = [];
let resizeTimer;

const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

// ---- Utilities ----

function escapePath(p) {
    return p.replaceAll('\\', '\\\\');
}

function extname(p) {
    const base = p.split(/[\\/]/).pop();
    const dot = base.lastIndexOf('.');
    return dot >= 0 ? base.slice(dot).toLowerCase() : '';
}

function DMS2Decimal(degrees = 0, minutes = 0, seconds = 0, direction = 'N') {
    if (!['N', 'S', 'E', 'W'].includes(direction.toUpperCase())) return 0;
    let decimal = degrees + minutes / 60 + seconds / 3600;
    if (direction.toUpperCase() === 'S' || direction.toUpperCase() === 'W') decimal *= -1;
    return decimal;
}

function haversineDistance(a, b) {
    const R = 6371000;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const x = Math.sin(dLat / 2) ** 2 +
               Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// ---- IPC listeners (set up before DOMContentLoaded) ----

window.electronAPI.onUpdateStatus(text => {
    document.getElementById('footerUpdateText').innerHTML = text;
});

window.electronAPI.onExportExcel(() => {
    window.electronAPI.saveExcel(loadedImages);
});

// ---- Map Initialisation ----

document.addEventListener('DOMContentLoaded', () => {
    markerIcon = L.icon({
        iconUrl: './images/marker-icon.png',
        iconSize: [32, 32],
        iconAnchor: [15, 31]
    });
    selectedMarkerIcon = L.icon({
        iconUrl: './images/marker-icon-selected.png',
        iconSize: [32, 32],
        iconAnchor: [15, 31]
    });

    map = L.map('map', {
        attributionControl: false,
        touchZoom: true,
        edgeBufferTiles: 5,
        zoomControl: false
    });
    map.setView([54.687157, 25.279652], 13);

    const mapLayers = {
        'OpenStreet Map':  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map),
        'Google Street':   L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }),
        'Google Terrain':  L.tileLayer('https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }),
        'Google Hybrid':   L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }),
        'Google Satellite': L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }),
    };
    const mapOverlays = {
        'GPS Traces': L.tileLayer('https://gps-{s}.tile.openstreetmap.org/lines/{z}/{x}/{y}.png', { maxZoom: 19 })
    };

    map.addControl(new L.Control.Layers(mapLayers, mapOverlays));
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Recalculate after CET finishes its DOM rearrangement
    setTimeout(() => map.invalidateSize(), 150);
});

window.addEventListener('resize', () => {
    document.body.classList.add('resize-animation-stopper');
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => document.body.classList.remove('resize-animation-stopper'), 400);
});

// ---- Modals ----

function openAddImageModal() {
    document.getElementById('addImageModal').classList.add('is-active');
}

function closeAddImageModal() {
    if (document.getElementById('progressBarStatus').innerHTML === 'Standby') {
        document.getElementById('addImageModal').classList.remove('is-active');
    }
}

function openImageOptionsModal(imagePath) {
    const esc = escapePath(imagePath);
    document.getElementById('imageOptionsModalContent').innerHTML = `
        <div class="field has-addons">
            <div class="control is-expanded">
                <input class="input" type="text" id="maxDistance" placeholder="Radius in meters to select other points">
            </div>
            <div class="control">
                <a class="button is-info" onclick="renderer.selectImageRadius('${esc}')">Select</a>
            </div>
        </div>
        <div class="notification is-danger is-hidden" id="imageOptionsErrorBox">
            <button class="delete" onclick="renderer.closeImageOptionsErrorBox()"></button>
            <div id="imageOptionsErrorBoxText"></div>
        </div>`;
    document.getElementById('imageOptionsModal').classList.add('is-active');
}

function closeImageOptionsModal() {
    document.getElementById('imageOptionsModal').classList.remove('is-active');
}

function closeImageOptionsErrorBox() {
    document.getElementById('imageOptionsErrorBox').classList.add('is-hidden');
}

// ---- Image Loading ----

async function processPath(imagePath) {
    if (!SUPPORTED_EXTENSIONS.includes(extname(imagePath))) return;
    if (loadedImages.some(img => img.path === imagePath)) return;

    let imageName;
    let imageExif = true;
    let imageGPS = true;
    let imageLatitude = 0;
    let imageLongitude = 0;
    let imageMarker;

    const result = await window.electronAPI.readExif(imagePath);
    const name = result.basename;

    if (!result.success) {
        imageName = `[ERROR] ${name}`;
    } else if (result.data == null) {
        imageName = `[NO EXIF] ${name}`;
        imageExif = false;
    } else {
        const gps = result.data.gps;
        if (
            !gps ||
            gps.GPSLatitude == null || gps.GPSLongitude == null ||
            gps.GPSLatitudeRef == null || gps.GPSLongitudeRef == null
        ) {
            imageName = `[NO GPS] ${name}`;
            imageGPS = false;
        } else {
            imageName = name;
            imageLatitude  = DMS2Decimal(...gps.GPSLatitude,  gps.GPSLatitudeRef);
            imageLongitude = DMS2Decimal(...gps.GPSLongitude, gps.GPSLongitudeRef);

            imageMarker = L.marker([imageLatitude, imageLongitude], { icon: markerIcon });
            imageMarker.addTo(map).on('mousedown', () => {
                const esc = escapePath(imagePath);
                document.getElementById(esc).scrollIntoView();
                const img = loadedImages.find(i => i.path === imagePath);
                img.selected = !img.selected;
                document.getElementById(esc).querySelector('.list-item-title input').checked = img.selected;
                imageMarker.setIcon(img.selected ? selectedMarkerIcon : markerIcon);
            });
        }
    }

    loadedImages.push({ name: imageName, selected: false, path: imagePath, exif: imageExif, gps: imageGPS, latitude: imageLatitude, longitude: imageLongitude });
    loadedMarkers.push({ path: imagePath, marker: imageMarker });

    const esc = escapePath(imagePath);
    document.getElementById('imageList').innerHTML += `
        <div class="list-item">
            <div class="list-item-content" id="${esc}">
                <div class="list-item-title"><input type="checkbox" class="mr-2" onclick="renderer.selectImage('${esc}')">${imageName}</div>
                <div class="list-item-description">${imagePath}</div>
            </div>
            <div class="list-item-controls">
                <div class="buttons is-right">
                    <button class="button">
                        <span class="icon is-small"><i class="fa-solid fa-arrow-up-right-from-square"></i></span>
                        <span onclick="renderer.openImage('${esc}')">Open</span>
                    </button>
                    <button class="button" onclick="renderer.openImageOptionsModal('${esc}')">
                        <span class="icon is-small"><i class="fas fa-ellipsis-h"></i></span>
                    </button>
                </div>
            </div>
        </div>`;
}

async function openDialog() {
    if (document.getElementById('progressBarStatus').innerHTML !== 'Standby') return;

    const paths = await window.electronAPI.openImages();
    if (!paths || paths.length === 0) return;

    const progressBar = document.getElementById('progressBar');
    const progressBarStatus = document.getElementById('progressBarStatus');

    progressBarStatus.innerHTML = 'Loading...';
    progressBar.classList.replace('is-primary', 'is-warning');
    progressBar.max = paths.length;
    progressBar.value = 0;

    for (const imagePath of paths) {
        await processPath(imagePath);
        progressBar.value += 1;
    }

    progressBar.classList.replace('is-warning', 'is-primary');
    progressBarStatus.innerHTML = 'Standby';
    document.getElementById('addImageModal').classList.remove('is-active');
}

// ---- Selection ----

function selectImage(imagePath) {
    const image = loadedImages.find(img => img.path === imagePath);
    const marker = loadedMarkers.find(m => m.path === imagePath);
    if (marker.marker) marker.marker.setIcon(image.selected ? markerIcon : selectedMarkerIcon);
    image.selected = !image.selected;
}

function selectAllImages() {
    for (const image of loadedImages) {
        const marker = loadedMarkers.find(m => m.path === image.path);
        image.selected = true;
        document.getElementById(escapePath(image.path)).querySelector('.list-item-title input').checked = true;
        if (marker.marker) marker.marker.setIcon(selectedMarkerIcon);
    }
}

function inverseImageSelection() {
    for (const image of loadedImages) {
        const marker = loadedMarkers.find(m => m.path === image.path);
        image.selected = !image.selected;
        document.getElementById(escapePath(image.path)).querySelector('.list-item-title input').checked = image.selected;
        if (marker.marker) marker.marker.setIcon(image.selected ? selectedMarkerIcon : markerIcon);
    }
}

function removeImage() {
    for (const image of [...loadedImages]) {
        if (!image.selected) continue;
        document.getElementById(escapePath(image.path)).parentElement.remove();
        loadedImages = loadedImages.filter(img => img.path !== image.path);
        const marker = loadedMarkers.find(m => m.path === image.path);
        if (marker.marker) {
            map.removeLayer(marker.marker);
            loadedMarkers = loadedMarkers.filter(m => m.path !== image.path);
        }
    }
}

function openImage(imagePath) {
    window.electronAPI.openPath(imagePath);
}

// ---- Radius Selection ----

function selectImageRadius(imagePath) {
    const image = loadedImages.find(img => img.path === imagePath);
    if (!image.exif) return showOptionsError('This image does not have EXIF data!');
    if (!image.gps)  return showOptionsError('This image does not have GPS data!');

    const maxDistance = parseFloat(document.getElementById('maxDistance').value);
    const origin = { latitude: image.latitude, longitude: image.longitude };

    for (const other of loadedImages) {
        if (haversineDistance(origin, { latitude: other.latitude, longitude: other.longitude }) < maxDistance) {
            other.selected = true;
            const marker = loadedMarkers.find(m => m.path === other.path);
            if (marker.marker) marker.marker.setIcon(selectedMarkerIcon);
            document.getElementById(escapePath(other.path)).querySelector('.list-item-title input').checked = true;
        }
    }

    document.getElementById('imageOptionsModal').classList.remove('is-active');
}

function showOptionsError(text) {
    document.getElementById('imageOptionsErrorBox').classList.remove('is-hidden');
    document.getElementById('imageOptionsErrorBoxText').textContent = text;
}

// ---- Navbar ----

function navBarControl() {
    const navbar = document.getElementById('navbar');
    const icon = document.getElementById('navbarControlIcon');
    if (navbar.style.left === 'calc(-33.3333vw)') {
        navbar.style.left = '0px';
        icon.className = 'fa-solid fa-chevron-left';
    } else {
        navbar.style.left = 'calc(-33.3333vw)';
        icon.className = 'fa-solid fa-chevron-right';
    }
}

// ---- Public API (for HTML onclick handlers) ----

window.renderer = {
    openDialog,
    openAddImageModal,
    closeAddImageModal,
    openImageOptionsModal,
    closeImageOptionsModal,
    closeImageOptionsErrorBox,
    selectImage,
    selectAllImages,
    inverseImageSelection,
    removeImage,
    openImage,
    selectImageRadius,
    navBarControl,
};
