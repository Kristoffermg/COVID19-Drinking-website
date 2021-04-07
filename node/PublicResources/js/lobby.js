const socket = io({path:'/node0/socket.io', transports: ["polling"]});

const createLobby = document.getElementById("createLobby");
const lobbyURL = document.getElementById("lobbyurl");
const copyURL = document.getElementById("copyURL");
const usernameInput = document.getElementById("username");
const setUsername = document.getElementById("setUsername");

let id = document.URL.split("/Lobby/")[1];
let logo = document.getElementById("navbar__logo");

socket.emit("joinRoom", id);

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

logo.addEventListener("click", () => {
    socket.emit("debug");
});