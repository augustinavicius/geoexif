/*
    Inverts all selections and changes markers if there is a corresponding one (image list might contains images, that do not have gps
    data, therefore no marker).
*/
module.exports.load = () => {
    for (var i = 0; i < loadedImages.length; i++) {
        let image = loadedImages[i];
        let imageMarker = loadedMarkers.find(marker => marker.path == image.path);

        if (image.selected) {
            loadedImages[i].selected = false;
            document.getElementById(image.path.replaceAll('\\', '\\\\')).querySelector('.list-item-title').querySelector('input').checked = false;

            if (imageMarker.marker) imageMarker.marker.setIcon(markerIcon);
        } else {
            loadedImages[i].selected = true;
            document.getElementById(image.path.replaceAll('\\', '\\\\')).querySelector('.list-item-title').querySelector('input').checked = true;

            if (imageMarker.marker) imageMarker.marker.setIcon(selectedMarkerIcon);
        }
    }
}