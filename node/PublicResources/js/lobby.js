console.log("lobby executed");



//Sets different variables
logo = document.getElementById("navbar__logo");
usernameButton = document.getElementById("setUsername");
settingsTab = document.getElementById("settingstab");
copyUrl = document.getElementById("copyURL");
startGame = document.getElementById("startGame");


debug = document.querySelector("div.videoDiv#idclient");

//console.log(usernameButton);

//socket.emit("joinRoom", idxd);

//Debug funktion (runs when clicking on the Settings header)
// debugMeme.addEventListener("click", () => {
//     //socket.emit('startGame', 'test1');
//     socket.emit("checkAdminStatus");
// });

startGame.addEventListener("click", () => {
    let gameSelect = document.getElementById("gameSelect");
    socket.emit('startGame', gameSelect.value);
});


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
    console.log("name: " + newUserName + " id: " + clientPeerId);
    socket.emit("changeName", newUserName, clientPeerId);
})

//Get's username from backend, so it can be updated on the site
socket.on('changeName', (name, userId) =>{
    let userPlace = document.getElementById("id"+userId);
    let check;
    
    if (userPlace == dontTouch) {
        userPlace = document.getElementById("idclient");
        console.log("userplace should be clien: " + userPlace);
        check = document.querySelector("div.videoDiv#idclient > p");
    } else {
        check = document.querySelector("div.videoDiv#id" + userId + " > p");
        console.log("userplace should be non-client: " + userPlace);
    }
    console.log("Check: " + check);
    
    if (check != dontTouch) {
        check.remove();
    }
    console.log("User " + userId + "changed name to " + name);

    console.log("userplace should be whatever: " + userPlace);
    let displayName = document.createElement("p");
    displayName.setAttribute("id", "userNamePara");
    displayName.innerText = name;
    userPlace.append(displayName);
});

socket.on('noAdminPerm', () => {
    console.log("No admin permission :)");
    window.alert("Only the lobby admin (lobby creater by default) has permission to start the game");
});

socket.on('checkAdminStatus', status => {
    console.log("Status: " + status);
});

socket.on('makeAdmin', () => {
    console.log("U is admin :)");
    settingsTab.hidden = false;
    startGame.hidden = false;
    isAdmin = true; 
    socket.emit('makeAdmin');
});

socket.on('meme', () => {
    console.log("it werk smile");
});

socket.on('yeetAdminStuff', () => {
    isAdmin = false;
    settingsTab.hidden = true;
    startGame.hidden = true; 
});


// The code below serves the purpose of making a push
// of the enter button, set one's username so a click by mouse on "Set Username" won't be required
// It should have sockets integrated into it, 

var input = document.getElementById("username");
input.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
   event.preventDefault();
   document.getElementById("setUsername").click();
   socket.emit("changeName", newUserName, clientPeerId); //Not sure if this line works
  }
});
