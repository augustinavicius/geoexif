/*
    Dynamically generates a custom button (with input) for radius selection of points.
*/
module.exports.load = (imagePath) => {
    document.getElementById('imageOptionsModal').classList.add('is-active');

    var imageEntry = `
    <div class="field has-addons">
        <div class="control is-expanded">
            <input class="input" type="text" id="maxDistance" placeholder="Radius in meters to select other points">
        </div>
        <div class="control">
            <a class="button is-info" onclick="renderer.selectImageRadius('${imagePath.replaceAll('\\', '\\\\')}')">
                Select
            </a>
        </div>
    </div>
    <div class="notification is-danger is-hidden" id="imageOptionsErrorBox">
        <button class="delete" onclick="renderer.closeImageOptionsErrorBox()"></button>
        <div id="imageOptionsErrorBoxText"></div>
    </div>`

    document.getElementById('imageOptionsModalContent').innerHTML = imageEntry;
}