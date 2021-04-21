let answerYes = 0;  //Counter which shows how many rounds one has answered yes
let answerNo = 0;   //Counter which shows how many rounds one has answered no

let timerBar = document.getElementById("timer")
let neverText = document.getElementById("neverText")
let nextText = document.getElementById("nextText")
let iHave = document.getElementById("iHave");
let iHaveNever = document.getElementById("iHaveNever");


/* change the timer bar seconds whatever 
document.getElementById("timer").style.setProperty("--duration", 10)
*/ 

neverText.innerText = "Click \"Next round\" to start the game"

nextText.addEventListener("click", () => {
    socket.emit('neverLogic');
    nextText.style.opacity = 0.9;
    nextText.disabled = true;
    nextText.value = "Next round";

    iHave.style.opacity = 1;
    iHave.disabled = false;

    iHaveNever.style.opacity = 0.9;
    iHaveNever.disabled = false;
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
});

socket.on('gameOver', () => {
    neverText.innerHTML = "GAME OVER LOSERS";
});

socket.on('countdownTick', () => {
    console.log("yooooooooooooooooooooooooooooooooooooooooooo im in countdownTick!")
    let duration = getComputedStyle(document.documentElement)
        .getPropertyValue('--duration')
    timerBar.style.setProperty('--duration', 10)
})