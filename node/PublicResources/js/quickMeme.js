console.log("oh no");

debugMeme = document.getElementById("debugMeme");

debugMeme.addEventListener("click", () => {
    socket.emit('startGame', 'test2');
});