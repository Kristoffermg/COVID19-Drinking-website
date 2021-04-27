let answerYes = 0;  //Counter which shows how many rounds one has answered yes
let answerNo = 0;   //Counter which shows how many rounds one has answered no
let neverAnswer;


let roundtimeBar = document.querySelector(".round-time-bar")
let neverText = document.getElementById("neverText")
let nextText = document.getElementById("nextText")
let iHave = document.getElementById("iHave");
let iHaveNever = document.getElementById("iHaveNever");
let sipText = document.getElementById("sipText");

neverText.innerHTML = "Never have I ever ";
/* change the timer bar seconds whatever 
document.getElementById("timer").style.setProperty("--duration", 10)
*/ 
console.log("Admin status: " + isAdmin);


if (isAdmin) socket.emit('neverLogic', true);


nextText.addEventListener("click", () => {
    socket.emit('neverLogic', false);
    nextText.style.opacity = 0.9;
    nextText.disabled = true;
    nextText.value = "Next round";

    iHave.style.opacity = 1;
    iHave.disabled = false;

    iHaveNever.style.opacity = 0.9;
    iHaveNever.disabled = false;

    sipText.style.display = "none";
});

socket.on('activateNextRoundBtn', () => {
    nextText.style.opacity = 1;
    nextText.disabled = false;
})

socket.on('revealAnswer', (answerArray) => {
    //jeres tur frontend folk
});

socket.on('nextPrompt', prompt => {
    console.log("nextPromptTriggger");
    neverText.innerHTML = "Never have I ever " + prompt;

    roundtimeBar.style.display = "block";
    roundtimeBar.classList.remove("round-time-bar");
    roundtimeBar.offsetWidth;
    roundtimeBar.classList.add("round-time-bar");
});

socket.on('gameOver', () => {
    neverText.innerHTML = "GAME OVER LOSERS";
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
    socket.emit('neverAnswer', neverAnswer, clientPeerId);
});