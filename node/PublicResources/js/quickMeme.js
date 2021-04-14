console.log("quickMeme executed");

debugMeme = document.getElementById("debugMeme");

debugMeme.addEventListener("click", () => {
    socket.emit('startGame', 'test2');
});