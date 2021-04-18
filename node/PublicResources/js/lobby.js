console.log("lobby executed");

//Gets the roomID from the backend
socket.on('roomId', (roomId) => {
    let lobbyUrl = document.getElementById("lobbyurl");
    
    console.log('backend roomid ' + roomId);
    console.log('idxd ' + idxd);

    if(idxd == "" || idxd == dontTouch){
        ROOM_ID = roomId;
        idFlag = true;
        lobbyUrl.value = document.URL + ROOM_ID;
                
    }else{
        ROOM_ID = idxd;
        idFlag = false;
        lobbyUrl.value = document.URL;
    }

    console.log('ROOOOOOOM ' + ROOM_ID);

    //ROOM_ID = roomId;
});

//Sets different variables
idxd = document.URL.split("/Lobby/")[1];
logo = document.getElementById("navbar__logo");
usernameButton = document.getElementById("setUsername");
debugMeme = document.getElementById("debugMeme");
copyUrl = document.getElementById("copyURL");
startGame = document.getElementById("startGame");
camera_enabled = document.getElementById("camera-enabled")
camera_disabled = document.getElementById("camera-disabled")
//console.log(usernameButton);

//socket.emit("joinRoom", idxd);

//Debug funktion (runs when clicking on the Settings header)
debugMeme.addEventListener("click", () => {
    socket.emit('startGame', 'test1');
});

startGame.addEventListener("click", () => {
    let gameSelect = document.getElementById("gameSelect");
    socket.emit('startGame', gameSelect.value);
})


//Adds the lobby URL to the clipboard
copyUrl.addEventListener("click", () => {
    let lobbyUrl = document.getElementById("lobbyurl");
    lobbyUrl.select();
    document.execCommand("copy");
});

//Debug meme der ikke bliver brugt lmao
logo.addEventListener("click", () => {
    socket.emit("debug");
});

//Changes the username
usernameButton.addEventListener("click", () => {
    let newUserName = document.getElementById("username").value;
    //console.log("username: " + newUserName);
    socket.emit("changeName", newUserName);
})

camera_disabled.addEventListener("click", () => {
    camera_disabled.style.display = "none"
    camera_enabled.style.display = "block"
    enableCamera()
})

camera_enabled.addEventListener("click", () => {
    camera_enabled.style.display = "none"
    camera_disabled.style.display = "block"
    disableCamera()
})



//Get's username from backend, so it can be updated on the site
socket.on('changeName', name =>{
    console.log("Username: " + socket.userName);
});