let answerYes = 0;  //Counter which shows how many rounds one has answered yes
let answerNo = 0;   //Counter which shows how many rounds one has answered no
let neverAnswer;


let roundtimeBar = document.querySelector(".round-time-bar")
let neverText = document.getElementById("neverText")
let nextText = document.getElementById("nextText")
let iHave = document.getElementById("iHave");
let iHaveNever = document.getElementById("iHaveNever");
let sipText = document.getElementById("sipText");
let sendBTN = document.getElementById("sendBTN");
let textMsg = document.getElementById("textMessage");
let votes = document.getElementById("votes");
let messageBox = document.getElementById("message");
let quitGame = document.getElementById("quitGame");

let whiteBackground = true;
let firstTurn_ = true;

let answerPressed

/* change the timer bar seconds whatever 
document.getElementById("timer").style.setProperty("--duration", 10)
*/ 
console.log("Admin status: " + isAdmin);

// Prevents an issue where a new prompt would be generated when people other than the admin joins
if (isAdmin) socket.emit('neverLogic', true);

nextText.addEventListener("click", () => {
    socket.emit('neverLogic', false);
    
    nextText.style.backgroundColor = "#efefef4d";
    nextText.disabled = true;
    nextText.value = "Next round";

    iHave.style.backgroundColor = "#efefef";
    iHaveNever.style.backgroundColor ="#efefef";

    neverAnswer = false;
});

socket.on('setRoundtime', roundtime => {
    console.log("Round time: " + roundtime)
    roundtimeBar.style.setProperty('--duration', roundtime);
});

socket.on('setSipText', amountOfSips => {
    sipText.innerText = `Take ${amountOfSips} of your drink`;
});

socket.on('activateNextRoundBtn', () => {
    nextText.disabled = false;
    nextText.style.backgroundColor = "#efefef";
    iHave.disabled = true;
    iHaveNever.disabled = true;
    votes.style.opacity = 1;

    if (answerPressed == false) {
        iHave.style.backgroundColor = "#efefef4d"
        iHaveNever.style.backgroundColor = "#efefef4d"
    } 
    
    if (neverAnswer == true) {
        sipText.style.opacity = 1;
    }
})

socket.on('revealAnswer', (answerArray) => {
    votes.innerHTML = `0/${Math.ceil(votingRight_ / 2)} Votes`;
    //answerArr 0 = id, 1 = svar
    let border;
    for (let i = 0; i < answerArray.length; i++) {
        border = document.querySelector('div.videoDiv#id' + answerArray[i][0] + ' > img');
        console.log(border);
        if (border == dontTouch) {
            border = document.querySelector('div.videoDiv#id' + answerArray[i][0] + ' > img');
            if (border != dontTouch) {
                if (answerArray[i][1]) {
                    border.style.outlineColor = 'green';
                } else {
                    border.style.outlineColor = 'red';
                }
            }
        } else {
            if (answerArray[i][1]) {
                border.style.outlineColor = 'green';
            } else {
                border.style.outlineColor = 'red';
            }
        }
    }
});

socket.on('nextPrompt', prompt => {
    answerPressed = false;
    let allVideoDiv = document.querySelectorAll('div#video-grid > div.videoDiv');

    for (let i = 0; i < allVideoDiv.length; i++) {
        console.log(allVideoDiv[i]);
        allVideoDiv[i].childNodes[0].style.outlineColor = 'white';
    }

    neverText.innerHTML = "Never have I ever " + prompt;

    roundtimeBar.style.display = "block";
    roundtimeBar.classList.remove("round-time-bar");
    roundtimeBar.offsetWidth;
    roundtimeBar.classList.add("round-time-bar");

    nextText.style.opacity = 0.9;
    nextText.disabled = true;
    nextText.value = "Next round";

    sipText.style.opacity = 0;

    iHave.disabled = false;
    iHaveNever.disabled = false;

    votes.style.opacity = 0;

    votes.innerHTML = `${voteCount_}/${Math.ceil((votingRight_ / 2))} Votes`;
});

socket.on('gameOver', () => {
    neverText.innerHTML = "GAME OVER, CHEERS!! Down your drink!";
});

socket.on('voting', (voteCount, votingRight, firstTurn) => {
    voteCount_ = voteCount;
    votingRight_ = votingRight;
    firstTurn_ = false;
    votes.innerHTML = `${voteCount}/${Math.ceil(votingRight_ / 2)} Votes`;
});

iHave.addEventListener("click", () => {
    answerPressed = true;
    iHave.style.backgroundColor ="rgb(9, 255, 0)"
    iHave.disabled = true;

    iHaveNever.disabled = true;
    iHaveNever.style.backgroundColor = "#efefef4d";

    neverAnswer = true;
    socket.emit('neverAnswer', neverAnswer, clientPeerId);
});

iHaveNever.addEventListener("click", () => {
    answerPressed = true;
    iHave.style.backgroundColor ="#efefef4d"
    iHave.disabled = true;

    iHaveNever.style.backgroundColor = "rgb(255, 0, 0)";
    iHaveNever.disabled = true;

    neverAnswer = false;
    socket.emit('neverAnswer', neverAnswer);
});

quitGame.addEventListener("click", () => {
    if(isAdmin) socket.emit('quitToLobby');
});

// Execute a function when the user releases a key on the keyboard
textMsg.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      sendBTN.click();
    }
});

sendBTN.addEventListener("click", () => {
    sendMessage();
    textMsg.value = "";
});

socket.on('newMessage', (chatMessage, userId) => {
    let userNameDiv = document.getElementById("id" + userId);
    let userNamePara = userNameDiv.childNodes[1];
    let username = userNamePara.innerText;

    if (userId == clientSocketId) {
        let newMessageDiv = document.createElement("div");
        newMessageDiv.classList.add("newMessageDiv")
        let newMessage = document.createElement("P");
        newMessage.classList.add("newMessage");
        newMessage.innerText = `${chatMessage}`;
        message.appendChild(newMessageDiv)
        newMessageDiv.appendChild(newMessage);
        newMessageDiv.style.justifyContent = "flex-end";
        newMessage.style.background = "linear-gradient(to bottom, rgb(29, 109, 214), rgb(29, 150, 214)";
    } else {
        let newMessage = document.createElement("P");
        newMessage.classList.add("newMessage");
        newMessage.innerText = `${username}: ${chatMessage}`;
        message.appendChild(newMessage);
        newMessage.style.backgroundColor = "white";
        newMessage.style.color = "black";
    }

    // Automatically scrolls down to the bottom in the message box
    messageBox.scrollTop = messageBox.scrollHeight;
})

function sendMessage() {
    let textMessage = sanitize(textMsg.value);
    console.log("Message" + textMessage);
    if(textMessage.length > 0) {
        socket.emit("chatMessage", textMessage, clientSocketId);
    }
}
// Get the input field
var input = document.getElementById("myInput");


// Avoids HTML injection
function sanitize(input) {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}