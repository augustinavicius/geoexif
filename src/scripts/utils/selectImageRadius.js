// Haversine Formula
const haversine = require('haversine-distance');

/*
    Based on an already present point in the map, this function compares all points to the max
    distance provided by the user, by using haversine formula.
*/
module.exports.load = (imagePath) => {
    var image = loadedImages.find(image => image.path == imagePath);
    var imageGPS = { latitude: image.latitude, longitude: image.longitude };
    var maxDistance = document.getElementById('maxDistance').value;

    if (!image.exif) return showImageOptionsErrorBox('This image does not have EXIF data!');
    if (!image.gps) return showImageOptionsErrorBox('This image does not have GPS data!');

    for (var i = 0; i < loadedImages.length; i++) {
        let secondImage = loadedImages[i];
        let secondImageGPS = { latitude: secondImage.latitude, longitude: secondImage.longitude };
        let distance = haversine(imageGPS, secondImageGPS);


        if (distance < maxDistance) {
            loadedImages[i].selected = true;
            let imageMarker = loadedMarkers.find(marker => marker.path == secondImage.path);
            if (imageMarker.marker) imageMarker.marker.setIcon(selectedMarkerIcon);
            document.getElementById(secondImage.path.replaceAll('\\', '\\\\')).querySelector('.list-item-title').querySelector('input').checked = true;
        }
    }

    document.getElementById('imageOptionsModal').classList.remove('is-active')
    
    // Functions 
    function showImageOptionsErrorBox(text) {
        document.getElementById('imageOptionsErrorBox').classList.remove('is-hidden');
        document.getElementById('imageOptionsErrorBoxText').textContent = text;
    }
}