/*
    Checks all loadedImages cache, checks if an image is selected and removes it from the
    loadedImages cache, and if marker exists, from the loadedMarkers cache.
*/
module.exports.load = () => {
    var tempLoadedImages = loadedImages;
    for (var i = 0; i < tempLoadedImages.length; i++) {
        // Image Var
        let image = tempLoadedImages[i];
        // Check if Selected
        if (!image.selected) continue;

        // Image Path
        let imagePath = image.path;

        // Remove DIV
        document.getElementById(imagePath.replaceAll('\\', '\\\\')).parentElement.remove();

        // Remove Image Data from Cache
        loadedImages = loadedImages.filter((image) => { return image.path != imagePath });

        // Remove Image Marker Data from Cache
        let imageMarker = loadedMarkers.find(image => image.path == imagePath);
        if (imageMarker.marker) { // Marker exists (there is GPS data)
            map.removeLayer(imageMarker.marker);
            loadedMarkers = loadedMarkers.filter((marker) => { return marker.path != imagePath });
        }
    }
}