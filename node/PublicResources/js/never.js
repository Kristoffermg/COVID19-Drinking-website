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

let whiteBackground = true;

/* change the timer bar seconds whatever 
document.getElementById("timer").style.setProperty("--duration", 10)
*/ 
console.log("Admin status: " + isAdmin);

// Prevents an issue where a new prompt would be generated when people other than the admin joins
if (isAdmin) socket.emit('neverLogic', true);

nextText.addEventListener("click", () => {
    socket.emit('neverLogic', false);
    
    nextText.style.opacity = 0.9;
    nextText.disabled = true;
    nextText.value = "Next round";
});

socket.on('setRoundtime', roundtime => {
    console.log("Round time: " + roundtime)
    roundtimeBar.style.setProperty('--duration', roundtime);
});

socket.on('activateNextRoundBtn', () => {
    nextText.style.opacity = 1;
    nextText.disabled = false;

    iHave.style.opacity = 0.9;
    iHave.disabled = true;
    iHaveNever.style.opacity = 0.9;
    iHaveNever.disabled = true;

    if (neverAnswer == true) sipText.style.opacity = 1;
})

socket.on('revealAnswer', (answerArray) => {
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
    let allVideoDiv = document.querySelectorAll('div#video-grid > div.videoDiv');

    for (let i = 0; i < allVideoDiv.length; i++) {
        console.log(allVideoDiv[i]);
        allVideoDiv[i].childNodes[0].style.outlineColor = 'white';
    }

    console.log("nextPromptTriggger");
    neverText.innerHTML = "Never have I ever " + prompt;

    roundtimeBar.style.display = "block";
    roundtimeBar.classList.remove("round-time-bar");
    roundtimeBar.offsetWidth;
    roundtimeBar.classList.add("round-time-bar");

    nextText.style.opacity = 0.9;
    nextText.disabled = true;
    nextText.value = "Next round";

    sipText.style.opacity = 0;

    iHave.style.opacity = 1;
    iHave.disabled = false;

    iHaveNever.style.opacity = 0.9;
    iHaveNever.disabled = false;
});

socket.on('gameOver', () => {
    neverText.innerHTML = "GAME OVER, CHEERS!!";
});

socket.on('voting', (voteCount, votingRight, firstTurn) => {
    if (firstTurn == false) {
        let votes = document.getElementById("votes");
        votes.innerHTML = `${voteCount}/${votingRight} votes`;
    }
});

iHave.addEventListener("click", () => {
    //sipText.style.display = "block";

    iHave.style.opacity = 0.9;
    iHave.disabled = true;
    iHaveNever.style.opacity = 0.9;
    iHaveNever.disabled = true;

    neverAnswer = true;
    socket.emit('neverAnswer', neverAnswer, clientPeerId);
});

iHaveNever.addEventListener("click", () => {
    iHave.style.opacity = 0.9;
    iHave.disabled = true;
    iHaveNever.style.opacity = 0.9;
    iHaveNever.disabled = true;

    neverAnswer = false;
    socket.emit('neverAnswer', neverAnswer);
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
    let newMessage = document.createElement("P");
    newMessage.classList.add("newMessage");
    newMessage.innerText = `${userId}: ${chatMessage}`;
    message.appendChild(newMessage);
    if(whiteBackground) newMessage.style.backgroundColor = "white";
    whiteBackground = !whiteBackground;
})

function sendMessage() {
    let textMessage = sanitize(textMsg.value);
    console.log("Message" + textMessage);
    let userNamePara = document.getElementById("userNamePara");
    let userid = userNamePara.innerText;
    socket.emit("chatMessage", textMessage, userid);
}
// Get the input field
var input = document.getElementById("myInput");


// Avoids HTML injection
function sanitize(input) {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}