const socket = io({path:'/node0/socket.io', transports: ["polling"]});

let id = document.URL.split("/Lobby/")[1];
let logo = document.getElementById("navbar__logo");

socket.emit("joinRoom", id);

logo.addEventListener("click", () => {
    socket.emit("debug");
});