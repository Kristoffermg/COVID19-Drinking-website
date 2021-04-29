let answerYes = 0;  //Counter which shows how many rounds one has answered yes
let answerNo = 0;   //Counter which shows how many rounds one has answered no
let neverAnswer;


let roundtimeBar = document.querySelector(".round-time-bar")
let neverText = document.getElementById("neverText")
let nextText = document.getElementById("nextText")
let iHave = document.getElementById("iHave");
let iHaveNever = document.getElementById("iHaveNever");
let sipText = document.getElementById("sipText");

/* change the timer bar seconds whatever 
document.getElementById("timer").style.setProperty("--duration", 10)
*/ 
console.log("Admin status: " + isAdmin);

socket.emit('mixCustomAndWrittenPrompts');

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
        allVideoDiv[i].childNodes[0].style.outlineColor = 'grey';
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

    sipText.style.display = "none";

    iHave.style.opacity = 1;
    iHave.disabled = false;

    iHaveNever.style.opacity = 0.9;
    iHaveNever.disabled = false;
});

socket.on('gameOver', () => {
    neverText.innerHTML = "GAME OVER LOSERS";
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