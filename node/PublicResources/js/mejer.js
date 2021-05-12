const rollBtn = document.getElementById('rollBtn');
const trueBtn = document.getElementById('trueBtn');
const lieBtn = document.getElementById('lieBtn');
const deroverBtn = document.getElementById('deroverBtn');
const liftBtn = document.getElementById('liftBtn');
const testFelt = document.getElementById('diceRoll');
const dice1 = document.getElementById('dice1');
const dice2 = document.getElementById('dice2');
const errorMes = document.getElementById('error');
const gameLog = document.getElementById('gameLog');
const sipText = document.getElementById('sipText');
let rollEnabled = false;
let trueEnabled = false;
let lieEnabled = false;
let deroverEnabled = false;
let liftEnabled = false;

let sendBTN = document.getElementById("sendBTN");
let textMsg = document.getElementById("textMessage");
let messageBox = document.getElementById("message");

if (isAdmin) socket.emit('mejerFirstTurn');

trueBtn.addEventListener("click", () => {
    if(trueEnabled){
        socket.emit('mejerTrue');
    }
});

lieBtn.addEventListener("click", () => {
    if(lieEnabled){
        socket.emit('mejerLie', dice1.value, dice2.value);
    }
});

deroverBtn.addEventListener("click", () => {
    if(deroverEnabled){
        socket.emit('mejerDerover');
    }
});

rollBtn.addEventListener("click", () => {
    if(rollEnabled){
        sipText.style.opacity = 0;

        socket.emit('mejerRoll');
        rollBtn.hidden = true;
        liftBtn.hidden = true;
        trueBtn.hidden = false;
        lieBtn.hidden = false;
        dice1.hidden = false;
        dice2.hidden = false;
        deroverBtn.hidden = false;
        
        rollEnabled = false;
        liftEnabled = false;
        trueEnabled = true;
        lieEnabled = true;
        deroverEnabled = true;
    }
});

liftBtn.addEventListener("click", () => {
    if(liftEnabled){
        socket.emit('mejerLift');
    }
});0

sendBTN.addEventListener("click", () => {
    sendMessage();
    textMsg.value = "";
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

// SOCKET CALLS
socket.on('firstTurn', () => {
    rollBtn.hidden = false;
    rollEnabled = true;
});

socket.on('startOfNewRound', () => {
    rollBtn.hidden = false;
    liftBtn.hidden = true;

    rollEnabled = true;
    liftEnabled = false;
    socket.emit('turnIndicator', true);
});


socket.on('mejerRoll', (lastRoll) => {
    testFelt.innerText = String(lastRoll[0]) + String(lastRoll[1]);
    if(lastRoll[0] == 1 && lastRoll[1] == 2) testFelt.innerText = "Meyer (12)";
    if(lastRoll[0] == 1 && lastRoll[1] == 3) testFelt.innerText = "Lil' Meyer (13)";
});

socket.on('lieError', () => {
    error.innerText = "Your lie is lower than what you have to beat"
});

socket.on('trueError', () => {
    error.innerText = "Your roll is lower than what you have to beat"
});

socket.on('clientTurn', () => {
    //------------WIP--------------
    rollBtn.hidden = false;
    liftBtn.hidden = false;

    rollEnabled = true;
    liftEnabled = true;
    socket.emit('turnIndicator', true);
});

socket.on('notTurn', () => {
    //------------WIP--------------
    rollBtn.hidden = true;
    liftBtn.hidden = true;
    trueBtn.hidden = true;
    lieBtn.hidden = true;
    dice1.hidden = true;
    dice2.hidden = true;
    deroverBtn.hidden = true;

    rollEnabled = false;
    liftEnabled = false;
    trueEnabled = false;
    lieEnabled = false;
    deroverEnabled = false;
    socket.emit('turnIndicator', false);
});

socket.on('incomingRoll', (roll) => {
    testFelt.innerText = roll;
    if(roll[0] == 1 && roll[1] == 2) testFelt.innerText = "Meyer (12)";
    if(roll[0] == 1 && roll[1] == 3) testFelt.innerText = "Lil' Meyer (13)";
});

socket.on('looseLife', (id, text) => {
    let memeArr = [];
    let lives;
    let counter;
    testFelt.innerText = text;

    memeArr = document.querySelectorAll('div.videoDiv#id' + id + ' > p');
    lives = memeArr[1];

    counter = Number(lives.innerText.split(" ")[1]);
    counter--;
    lives.innerText = `Lives: ${counter}`;

    //socket.emit('updateGameLog', `${id}, lost a life`);
});

socket.on('ded', (id, screenName) => {
    testFelt.innerText = `${screenName} us out`;
    let dedEl = document.querySelector("div.videoDiv#id" + id);
    dedEl.childNodes[0].style.outlineColor = 'red';
    //socket.emit('updateGameLog', `${id}, is ded smile`);
});

socket.on('gameOver', () => {
    window.alert('Game Over');
    window.location.href = '/node0/';
});

socket.on('updateGameLog', str => {
    let maxElements = 4;
    const element = document.createElement('li');
    element.setAttribute('id', 'listElement');
    element.innerHTML = str;
    gameLog.appendChild(element);

    let allListEl = document.querySelectorAll('#listElement');
    if (allListEl.length > maxElements) {
        allListEl[0].remove();
    }
});

socket.on('turnIndicator', (turnId, mejerLives, turnStart) => {
    let turnEl;

    for (let i = 0; i < mejerLives.length; i++) {
        if (turnId == mejerLives[i][0]) {
            turnEl = document.querySelector("div.videoDiv#id" + turnId);
            if (turnStart) {
                turnEl.childNodes[0].style.outlineColor = 'green';
            } else {
                turnEl.childNodes[0].style.outlineColor = 'grey';
            }
        }
    }
});

socket.on('everyoneDrink', () => {
    rollBtn.hidden = true;
    liftBtn.hidden = true;
    trueBtn.hidden = true;
    lieBtn.hidden = true;
    dice1.hidden = true;
    dice2.hidden = true;
    deroverBtn.hidden = true;

    rollEnabled = false;
    liftEnabled = false;
    trueEnabled = false;
    lieEnabled = false;
    deroverEnabled = false;

    testFelt.innerText = '32! Everyone drink!'
});

socket.on('drink', () => {
    sipText.style.opacity = 1;
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
    if(textMessage.length > 0) {
        socket.emit("chatMessage", textMessage, clientSocketId);
    }
}

function sanitize(input) {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
