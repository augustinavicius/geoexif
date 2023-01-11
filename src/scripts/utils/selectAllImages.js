/*
    Simply selects all images and changes marker style if one exists.
*/
module.exports.load = () => {
    for (var i = 0; i < loadedImages.length; i++) {
        let image = loadedImages[i];
        let imageMarker = loadedMarkers.find(marker => marker.path == image.path);

        image.selected = true;
        document.getElementById(image.path.replaceAll('\\', '\\\\')).querySelector('.list-item-title').querySelector('input').checked=true;

        if (imageMarker.marker) imageMarker.marker.setIcon(selectedMarkerIcon);
    }
}