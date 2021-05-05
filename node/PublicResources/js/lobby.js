console.log("lobby executed");

socket.emit('insertPromptQuery', "done this right first try");


//Sets different variables
logo = document.getElementById("navbar__logo");
usernameButton = document.getElementById("setUsername");
settingsTab = document.getElementById("contentLobby");
copyUrl = document.getElementById("copyURL");
startGame = document.getElementById("startGame");
let gameSelect = document.getElementById("gameSelect");
let neverHaveIEeverSettings = document.getElementById('neverHaveIEverSettings');
let ruleSelect = document.getElementById('ruleSelect');
let roundtimeSelect = document.getElementById("roundtimeSelect");
let addPrompt = document.getElementById("addPrompt")
let promptInput = document.getElementById('customprompttext')
let customPromptsList = document.getElementById('customPromptList');
let useCustomPromptsExclusively= document.getElementById('useCustomPromptsExclusively');
let usernameInput = document.getElementById('username');
const uploadPfp = document.getElementById('uploadPfp');
const inpFile = document.getElementById('inpFile');

// newDebugMeme = document.getElementById("newDebugMeme");

debug = document.querySelector("div.videoDiv#idclient");

//console.log(usernameButton);

//socket.emit("joinRoom", idxd);

//Debug funktion (runs when clicking on the Settings header)
// debugMeme.addEventListener("click", () => {
//     //socket.emit('startGame', 'test1');
//     socket.emit("checkAdminStatus");
// });

// newDebugMeme.addEventListener("click", () => {
//     console.log("THE NEW DEBUG BOY WAS CLICKED!");
//     socket.emit('DUMMYchangeName', "Bob", "This is a random bullshit string");
// });

startGame.addEventListener("click", () => {
    socket.emit('startGame', gameSelect.value, ruleSelect.value, roundtimeSelect.value, useCustomPromptsExclusively.checked);
});

uploadPfp.addEventListener("submit", e => {
    // prevents the page from refreshing
    e.preventDefault(); 


    const formData = new FormData();

    // appends the first file in inpFile (the selected file)
    formData.append("inpFile", inpFile.files[0]);

    console.log(formData);
    console.log(inpFile.files[0]);
    socket.emit('insertProfilePictureQuery', inpFile.files[0]);
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

usernameInput.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      event.preventDefault();
      usernameButton.click();
    }
});

//Changes the username
usernameButton.addEventListener("click", () => {
    let newUserName = sanitize(document.getElementById("username").value);
    console.log("name: " + newUserName);
    socket.emit("changeName", newUserName);
    newUserName.value = "";

    let usernameSet = document.getElementById("usernameSet");
    usernameSet.style.display = "block";
    let op = 1;
    let timer = setInterval(function () {
        if(op <= 0.1) {
            clearInterval(timer);
            usernameSet.style.display = "none";
        }
        usernameSet.style.opacity = op;
        usernameSet.style.filter = "alpha(opacity=" + op * 100 + ")";
        op -= op * 0.1;
    }, 100);

})

// Displays the settings for the games when they are selected
gameSelect.addEventListener('change', () => {
    if(gameSelect.value === 'prompt') {
        neverHaveIEeverSettings.style.display = 'block';
    } else if(gameSelect.value === 'dice') {
        neverHaveIEeverSettings.style.display = 'none';
    }
});

promptInput.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      event.preventDefault();
      addPrompt.click();
    }
});

//Adds promt
addPrompt.addEventListener("click", () => {
    if(promptInput.value.length === 0) return; 

    let newPrompt = document.createElement("P");
    newPrompt.classList.add("customPromtListText");
    newPrompt.innerText = sanitize(`Never have I ever ${promptInput.value}`);
    customPromptsList.appendChild(newPrompt);

    let deletebutton = document.createElement("button");
    deletebutton.innerText = "";
    deletebutton.classList.add("deleteBtn");
    newPrompt.appendChild(deletebutton);

    console.log("LEN: " + promptInput.value.length);
    socket.emit('storeCustomPrompt', promptInput.value);

    deletebutton.addEventListener("click", () => {
        let prompt = deletebutton.parentElement.innerText;
        socket.emit('deleteCustomPrompt', prompt);
        newPrompt.remove();
    });

    promptInput.value = "";
});

//PAAAAAAAAAAAAAAAAAAAAAAAAUSE!

socket.on('noAdminPerm', () => {
    console.log("No admin permission :)");
    window.alert("Only the lobby admin (lobby creater by default) has permission to start the game");
});

socket.on('checkAdminStatus', status => {
    console.log("Status: " + status);
});

socket.on('makeAdmin', () => {
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

// Avoids HTML injection
function sanitize(input) {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}


// The code below serves the purpose of making a push of the enter button, set one's username so a click
// by mouse on "Set Username" won't be required. It should have sockets integrated into it, 
/*
var input = document.getElementById("username");
input.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
   event.preventDefault();
   document.getElementById("setUsername").click();
   socket.emit("changeName", newUserName, clientPeerId); //Not sure if this line works
  }
});
*/