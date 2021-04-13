const socket = io({path:'/node0/socket.io', transports: ["polling"], autoConnect: false});  
console.log("socket connected" + socket.connected);
if (!socket.connected) {
    console.log("Entered weirdass if statement");
    socket.connect();
}

socket.on('changeHTML', meme => {
    let body = document.getElementById("body");
    let head = document.getElementById("head");
    newMeme = String(meme);
    let splitMeme = newMeme.split('<body id="body">')[1];
    splitMeme = splitMeme.split("</body>")[0];
    
    let videos = document.createElement("div");
    videos = document.getElementById("videos");
    body.remove();
    let newBody = document.createElement("body");
    newBody.innerHTML = splitMeme;
    head.after(newBody);
    let videoPlacement = document.getElementById("usernameInput");
    videoPlacement.after(videos);

    let scriptPlaceholder = document.getElementById("pageScript");
    let src = scriptPlaceholder.getAttribute("src");
    
    let pageScript = document.createElement("script");
    pageScript.src = src;
    scriptPlaceholder.remove();
    document.body.appendChild(pageScript);
});