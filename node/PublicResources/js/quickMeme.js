console.log("oh no");

let debugMeme2 = document.getElementById("debugMeme2");

debugMeme2.addEventListener("click", () => {
    socket.emit('startGame', 'test2');
});