// IPC Renderer
const { ipcRenderer } = require('electron');
// Leaflet
const L = require('leaflet');

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
    var osm_mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OSM Mapnik <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
});
