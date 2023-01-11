// Electron
const { shell } = require('electron');

/*
    Simple script to open an image in a gallery. This was done in a module instead of directly
    in renderer.js, because in the future it might be an option to have a built-in, faster image
    preview.
*/
module.exports.load = (imagePath) => {
    shell.openPath(imagePath);
}