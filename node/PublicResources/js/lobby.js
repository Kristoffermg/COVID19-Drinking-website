console.log("lobby executed");

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

idxd = document.URL.split("/Lobby/")[1];
logo = document.getElementById("navbar__logo");
usernameButton = document.getElementById("setUsername");
debugMeme = document.getElementById("debugMeme");
copyUrl = document.getElementById("copyURL");
//console.log(usernameButton);

//socket.emit("joinRoom", idxd);

debugMeme.addEventListener("click", () => {
    socket.emit('startGame', 'test1');
});

copyUrl.addEventListener("click", () => {
    let lobbyUrl = document.getElementById("lobbyurl");
    lobbyUrl.select();
    document.execCommand("copy");
});

socket.on('changeName', name =>{
    console.log("Username: " + socket.userName);
});

logo.addEventListener("click", () => {
    socket.emit("debug");
});

usernameButton.addEventListener("click", () => {
    let newUserName = document.getElementById("username").value;
    //console.log("username: " + newUserName);
    socket.emit("changeName", newUserName);
})