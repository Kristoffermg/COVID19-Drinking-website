const socket = io({path:'/../node2/socket.io/', transports: ["polling"]});

const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.navbar__menu');
const navLogo = document.querySelector('#navbar__logo');

const createLobby = document.getElementById("createLobby");
const lobbyURL = document.getElementById("lobbyurl");
const copyURL = document.getElementById("copyURL");
const usernameInput = document.getElementById("username");
const setUsername = document.getElementById("setUsername");

// Display Mobile Menu
const mobileMenu = () => {
  menu.classList.toggle('is-active');
  menuLinks.classList.toggle('active');
};

menu.addEventListener('click', mobileMenu);

// Show active menu when scrolling
const highlightMenu = () => {
  const elem = document.querySelector('.highlight');
  const homeMenu = document.querySelector('#home-page');
  const aboutMenu = document.querySelector('#about-page');
  const servicesMenu = document.querySelector('#services-page');
  let scrollPos = window.scrollY;
  // console.log(scrollPos);

  // adds 'highlight' class to my menu items
  if (window.innerWidth > 960 && scrollPos < 600) {
    homeMenu.classList.add('highlight');
    aboutMenu.classList.remove('highlight');
    return;
  } else if (window.innerWidth > 960 && scrollPos < 1400) {
    aboutMenu.classList.add('highlight');
    homeMenu.classList.remove('highlight');
    servicesMenu.classList.remove('highlight');
    return;
  } else if (window.innerWidth > 960 && scrollPos < 2345) {
    servicesMenu.classList.add('highlight');
    aboutMenu.classList.remove('highlight');
    return;
  }

  if ((elem && window.innerWIdth < 960 && scrollPos < 600) || elem) {
    elem.classList.remove('highlight');
  }
};

window.addEventListener('scroll', highlightMenu);
window.addEventListener('click', highlightMenu);

//  Close mobile Menu when clicking on a menu item
const hideMobileMenu = () => {
  const menuBars = document.querySelector('.is-active');
  if (window.innerWidth <= 768 && menuBars) {
    menu.classList.toggle('is-active');
    menuLinks.classList.remove('active');
  }
};

// Refer to a new location when the "Create Lobby" button has been clicked
createLobby.addEventListener("click", () => {
    location.href = "https://swb2-3.p2datsw.cs.aau.dk/createlobby.html";
});

function copyURLtest() {
    console.log("hell nah");
    lobbyURL.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand("copy");    
};

// Emits to the server side with the username (remember to make the input go through the cleaner function)
setUsername.addEventListener("click", () => {
    socket.emit("setUsername", {username: usernameInput.value});
});

menuLinks.addEventListener('click', hideMobileMenu);
navLogo.addEventListener('click', hideMobileMenu);