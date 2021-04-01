const socket = io({path:'/node0/socket.io', transports: ["polling"]});

const createLobbybutton = document.getElementById("createLobby");

createLobbybutton.addEventListener("click", () => {
    socket.emit("randomRoom");
});