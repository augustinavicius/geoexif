// Leaflet
const leaflet = require('leaflet');
// Leaflet Zoombox
require('leaflet-zoombox');
// Leaflet Edge Buffer
require('leaflet-edgebuffer');
// Leaflet Map Grid Fix
require('leaflet.tilelayer.nogap');

module.exports.loadMap = () => {
    // Create Map
    map = leaflet.map('map', { // Define 'map' id
        attributionControl: false,
        touchZoom: true,
        edgeBufferTiles: 5, // Preload tiles on the map view edges
        zoomControl: false // Added later with a changed position
    });
    map.setView([54.687157, 25.279652], 13); // Position & Zoom

    // Map Layers
    const mapLayers = {
        "OpenStreet Map": leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map),
        "Google Street": leaflet.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }),
        "Google Terrain": leaflet.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }),
        "Google Hybrid": leaflet.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }),
        "Google Sattelite": leaflet.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }),
    }
    // Overlays
    const mapOverlays = {
        "GPS Traces": leaflet.tileLayer('http://gps-{s}.tile.openstreetmap.org/lines/{z}/{x}/{y}.png', { maxZoom: 19 })
    }
    map.addControl(new leaflet.Control.Layers(mapLayers, mapOverlays)); // Map layers (maps) & overlays (gps traces)

    leaflet.control.zoom({ position: 'bottomright' }).addTo(map); // Modified zoom controls

    return map;
}