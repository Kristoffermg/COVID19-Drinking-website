console.log("lobby executed");

socket.emit('insertPromptQuery', "done this right first try");


//Sets different variables
logo = document.getElementById("navbar__logo");
usernameButton = document.getElementById("setUsername");
settingsTab = document.getElementById("settingstab");
copyUrl = document.getElementById("copyURL");
startGame = document.getElementById("startGame");
const addPrompt = document.getElementById("addPrompt")
const promptInput = document.getElementById('customprompttext')
const customPromptsList = document.getElementById('customPromptList');
const useCustomPromptsExclusively= document.getElementById('useCustomPromptsExclusively');
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
    let gameSelect = document.getElementById("gameSelect");
    let roundtimeSelect = document.getElementById("roundtimeSelect");
    console.log("CHECKBOX:" + useCustomPromptsExclusively.checked)
    socket.emit('startGame', gameSelect.value, roundtimeSelect.value, useCustomPromptsExclusively.checked);
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

//Adds promt
addPrompt.addEventListener("click", () => {
    let newPrompt = document.createElement("P");
    newPrompt.classList.add("customPromtListText");
    newPrompt.innerText = promptInput.value;
    customPromptsList.appendChild(newPrompt);

    let deletebutton = document.createElement("button");
    deletebutton.innerText = "";
    deletebutton.classList.add("deleteBtn");
    newPrompt.appendChild(deletebutton);

    console.log("LOL ->" + promptInput.value);
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