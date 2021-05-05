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
        console.log('deroverBtn');
    }
});

rollBtn.addEventListener("click", () => {
    if(rollEnabled){
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
        console.log('Lift Pressed');
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
    console.log("smile");
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

socket.on('smile', () => {
    socket.emit('dontMindMe');
});

socket.on('setTurnOrder', (mejerLives) => {
    let avatarArr = document.querySelectorAll('.videoDiv');
    let newArr = [];
    let livesPara;
    let tempAva;
    let vidGrid = document.getElementById('video-grid');
    console.log(avatarArr);

    for (let i = 0; i < mejerLives.length; i++) {
        for (let j = 0; j < avatarArr.length; j++) {
            if ('id' + mejerLives[i][0] == avatarArr[j].getAttribute('id')) {
                //console.log('Player: ' + avatarArr[j].getAttribute('id'));
                tempAva = document.createElement('div');
                tempAva = avatarArr[j];
                newArr.push(tempAva);
            }
        }
    }

    for (let i = 0; i < avatarArr.length; i++) {
        avatarArr[i].remove();
    }

    for (let i = 0; i < newArr.length; i++) {
        livesPara = document.createElement('p');
        livesPara.innerText = '6';
        livesPara.setAttribute('id', 'userNamePara');
        newArr[i].childNodes[0].style.outlineColor = 'grey';
        newArr[i].append(livesPara);
        vidGrid.append(newArr[i]);
    }
    newArr[0].childNodes[0].style.outlineColor = 'green';
    console.log(newArr);

    // socket.emit('dontMindMe');

});

socket.on('mejerRoll', (lastRoll) => {
    testFelt.innerText = String(lastRoll[0]) + String(lastRoll[1]);
});

socket.on('lieError', () => {
    error.innerText = "Your lie is lower than what you have to beat"
});

socket.on('trueError', () => {
    error.innerText = "Your roll is lower than what you have to beat"
});

socket.on('clientTurn', () => {
    //------------WIP--------------
    console.log("HER SKAL ALLE TURN BUTTONS OSV. BLIVE ACTIVE!");
    rollBtn.hidden = false;
    liftBtn.hidden = false;

    rollEnabled = true;
    liftEnabled = true;
    socket.emit('turnIndicator', true);
});

socket.on('notTurn', () => {
    //------------WIP--------------
    console.log("HER SKAL ALLE TURN BUTTONS OSV. FUCKING YEEEETUZ!");
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
    console.log(roll);
    testFelt.innerText = roll;
});

socket.on('looseLife', (id, screenName) => {
    let memeArr = [];
    let lives;
    let counter;
    testFelt.innerText = `${screenName}, lost a life`;

    memeArr = document.querySelectorAll('div.videoDiv#id' + id + ' > p');
    lives = memeArr[1];

    counter = Number(lives.innerText);
    counter--;
    lives.innerText = counter;

    //socket.emit('updateGameLog', `${id}, lost a life`);
});

socket.on('ded', (id, screenName) => {
    testFelt.innerText = `${screenName}, is ded smile`;
    let dedEl = document.querySelector("div.videoDiv#id" + id);
    dedEl.childNodes[0].style.outlineColor = 'red';
    //socket.emit('updateGameLog', `${id}, is ded smile`);
});

socket.on('gameOver', () => {
    window.alert('Game Over smile');
    console.log("lmao");
    window.location.href = '/';
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

socket.on('getUserName', () => {
    let userName = [];
    console.log('getUserName');
    userName = document.querySelector("div.videoDiv#id" + clientSocketId + " > p").innerText;
    //userName = document.getElementById('userNamePara');
    console.log(userName);
    socket.emit('getUserName', (userName));
});

socket.on('turnIndicator', (turnId, mejerLives, turnStart) => {
    let turnEl;
    console.log('ENTERED TURN INDICATOR!');
    console.log('turnId: ' + turnId);
    console.log('mejerLives: ');
    console.log(mejerLives);
    console.log('turnStart: ' + turnStart);

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
    testFelt.innerText = '32! Everyone drink!'
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

function sanitize(input) {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/*

html/css <-- kaster vi til Jeppe

*/