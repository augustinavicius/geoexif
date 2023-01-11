/*
    Selects an image and updates that image marker style, if it exists.
*/
module.exports.load = (imagePath) => {
    var image = loadedImages.find(image => image.path == imagePath);
    var imageMarker = loadedMarkers.find(marker => marker.path == imagePath);

    if (imageMarker.marker) { // Marker exists (there is GPS data)
        if (image.selected) {
            imageMarker.marker.setIcon(markerIcon);
        } else {
            imageMarker.marker.setIcon(selectedMarkerIcon);
        }
    }

    if (image.selected) {
        image.selected = false;
    } else {
        image.selected = true;
    }
}