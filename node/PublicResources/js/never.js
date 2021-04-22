let answerYes = 0;  //Counter which shows how many rounds one has answered yes
let answerNo = 0;   //Counter which shows how many rounds one has answered no

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

socket.on('nextPrompt', prompt => {
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

iHave.addEventListener("click", () => {
    sipText.style.display = "block";
})
