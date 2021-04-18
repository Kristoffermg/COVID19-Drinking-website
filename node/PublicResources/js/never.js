let answerYes = 0;  //Counter which shows how many rounds one has answered yes
let answerNo = 0;   //Counter which shows how many rounds one has answered no

let neverText = document.getElementById("neverText")
let nextText = document.getElementById("nextText")

neverText.innerText = "Click \"Next round\" to start the game"

nextText.addEventListener("click", () => {
    socket.emit('neverLogic');
});

socket.on('nextPrompt', prompt => {
    console.log("nextPromptTriggger");
    neverText.innerHTML = "Never have I ever " + prompt;
});

socket.on('gameOver', () => {
    neverText.innerHTML = "GAME OVER LOSERS";
});