console.log("oh no");

debugMeme = document.getElementById("debugMeme2");

debugMeme.addEventListener("click", () => {
    socket.emit('startGame', 'test2');
});