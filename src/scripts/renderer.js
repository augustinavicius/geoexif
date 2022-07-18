// IPC Renderer
const { ipcRenderer, webFrame } = require('electron');
// Leaflet
const leaflet = require('leaflet');
// Leaflet ZoomBox
const zoombox = require('leaflet-zoombox');
require('leaflet.tilelayer.nogap'); // Map white grid fix

// Update Status Event 
// Changes the text on the footer div to show the current app update progress.
ipcRenderer.on('updatestatus', (event, text) => {
    document.getElementById('footerUpdateText').innerHTML = text;
});

// Map Initialization
document.addEventListener('DOMContentLoaded', (event) => {
    // Initialize the map
    var map = L.map('map', {
        scrollWheelZoom: false,
        attributionControl: false,
        touchZoom: true
    });

    // Set the position and zoom level of the map
    map.setView([47.70, 13.35], 7);

    // Layers
    // OpenStreet View
    var openStreet = leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);
    // Google Streets
    var googleStreet = leaflet.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });
    // Google Terrain
    var googleTerrain = leaflet.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });
    // Google Hybrid
    var googleHybrid = leaflet.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });
    // Google Sattelite
    var googleSattelite = leaflet.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    // Layer Object
    var layers = {
        "OpenStreet Map": openStreet,
        "Google Streets": googleStreet,
        "Google Terrain": googleTerrain,
        "Google Hybrid": googleHybrid,
        "Google Sattelite": googleSattelite
    }

    // Overlays
    // OpenStreet View (GPS Traces)
    var openStreetGPS = leaflet.tileLayer('http://gps-{s}.tile.openstreetmap.org/lines/{z}/{x}/{y}.png', {
        maxZoom: 19
    });

    // Overlay Object
    var overlays = {
        "GPS Traces": openStreetGPS
    }

    // Add Layer & Overlay Control
    var layerControl = new leaflet.Control.Layers(layers, overlays);
    map.addControl(layerControl);

    // Zoom Box
    var zoomboxControl = leaflet.Control.ZoomBox({ modal: true, title: 'Box area zoom' });
    map.addControl(zoomboxControl);
});
