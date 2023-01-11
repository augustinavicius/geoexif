/*
    Applies a special class to the body element, that denied all animations, which allow for 'smoother'
    window resize process. If this was not done, the navigation bar would be seen adjusting on the left
    while chaning window size (the so-called after-image of the navbar would appear).
*/
module.exports.resizeControl = () => {
    var resizeTimer;
    document.body.classList.add("resize-animation-stopper");
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        document.body.classList.remove("resize-animation-stopper");
    }, 400);
}