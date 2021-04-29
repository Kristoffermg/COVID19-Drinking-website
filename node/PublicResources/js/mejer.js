const rollBtn = document.getElementById('rollBtn');
const trueBtn = document.getElementById('trueBtn');
const lieBtn = document.getElementById('lieBtn');
const deroverBtn = document.getElementById('deroverBtn');
const liftBtn = document.getElementById('liftBtn');
const testFelt = document.getElementById('diceRoll');
const dice1 = document.getElementById('dice1');
const dice2 = document.getElementById('dice2');
const errorMes = document.getElementById('error');
let rollEnabled = false;
let trueEnabled = false;
let lieEnabled = false;
let deroverEnabled = false;
let liftEnabled = false;

socket.emit('mejerFirstTurn');

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
});

// SOCKET CALLS
socket.on('firstTurn', () => {
    console.log("smile");
    rollBtn.hidden = false;
    rollEnabled = true;
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
});

socket.on('incomingRoll', (roll) => {
    console.log(roll);
    testFelt.innerText = roll;
});

socket.on('looseLife', (id) => {
    testFelt.innerText = `${id}, lost a life`;
});

socket.on('ded', (id) => {
    testFelt.innerText = `${id}, is ded smile`;
});

socket.on('gameOver', () => {
    window.alert('Game Over smile');
    console.log("lmao");
    window.location.href = '/';
});

/*

html/css
Scoreboard
bruge boaders til at vise hvis tur det er og sådan noget
Kort text log så man kan se hvad der foregår

*/