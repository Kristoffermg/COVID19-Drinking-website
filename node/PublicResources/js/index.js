const createLobbybutton = document.getElementById("createLobby");

createLobbybutton.addEventListener("click", () => {
    socket.emit("randomRoom");
});