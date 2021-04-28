const rollBtn = document.getElementById('rollBtn');
const trueBtn = document.getElementById('trueBtn');
const lieBtn = document.getElementById('lieBtn');
const deroverBtn = document.getElementById('deroverBtn');
const liftBtn = document.getElementById('liftBtn');
const testFelt = document.getElementById('diceRoll');
const dice1 = document.getElementById('dice1');
const dice2 = document.getElementById('dice2');

trueBtn.addEventListener("click", () => {
    socket.emit('mejerTrue');
});

lieBtn.addEventListener("click", () => {
    socket.emit('mejerLie', dice1.value, dice2.value);
});

deroverBtn.addEventListener("click", () => {
    socket.emit('mejerDerover');
});

rollBtn.addEventListener("click", () => {
    socket.emit('mejerRoll');
});

liftBtn.addEventListener("click", () => {
    socket.emit('mejerLift');
});

socket.on('mejerRoll', (lastRoll) => {
    testFelt.innerText = String(lastRoll[0]) + String(lastRoll[1]);
});

socket.on('lieError', () => {
    window.alert("Your lie is lower than what you have to beat");
});