// IPC Renderer
const { ipcRenderer } = require('electron');
// Leaflet
const leaflet = require('leaflet');

// Update Status Event 
// Changes the text on the footer div to show the current app update progress.
ipcRenderer.on('updatestatus', (event, text) => {
    document.getElementById('footer').innerHTML = text;
});

// Map Initialization
document.addEventListener('DOMContentLoaded', (event) => {
    // Initialize the map
    var map = L.map('map', {
        scrollWheelZoom: false
    });

    // Set the position and zoom level of the map
    map.setView([47.70, 13.35], 7);

    // Initialize the base layer
    // OpenStreet View
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OSM Mapnik <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    // Google Streets
    leaflet.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });
    // Google Terrain
    leaflet.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });
    // Google Hybrid
    leaflet.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });
    // Google Sattelite
    leaflet.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });
});
