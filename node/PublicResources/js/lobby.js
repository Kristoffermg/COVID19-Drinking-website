let id = document.URL.split("/Lobby/")[1];

socket.emit("joinRoom", id);