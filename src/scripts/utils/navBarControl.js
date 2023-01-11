/*
    If navbar is subtracted to -1/3 (-33.3333) of the view width, respectively change its 'left' style.
    If the condition is true, that mean navbar default value is overriden by -1/3, therefore it should be changed back to 0px.
    The same goes for if the navbar has the 0px property (or anything else, in case of human error defining widths of the div),
    so 'else' statement is used, which can be considered good practise.
*/
module.exports.navBarControl = () => {
    let navbar = document.getElementById('navbar');
    let navbarControlIcon = document.getElementById('navbarControlIcon');

    if (navbar.style.left == 'calc(-33.3333vw)') {  // Open Navbar
        navbar.style.left = '0px';
        navbarControlIcon.classList.value = 'fa-solid fa-chevron-left';
    } else {                                        // Close Navbar
        navbar.style.left = 'calc(-33.3333vw)';
        navbarControlIcon.classList.value = 'fa-solid fa-chevron-right';
    }
}