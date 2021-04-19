//Establishes socket connection, using the Socket.IO API
const socket = io({path:'/node0/socket.io', transports: ["polling"], autoConnect: false});  
console.log("socket connected" + socket.connected);
if (!socket.connected) {
    console.log("Entered weirdass if statement");
    socket.connect();
}

//Setup for the videochat
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer({
    config: {'iceServers': [
      { url: 'stun:stun.l.google.com:19302'},
      { url: 'turn:turn.bistri.com:80', credential: 'homeo', username: 'homeo'}
    ]} /* Sample servers, please use appropriate ones */
  });
const localVideo = document.createElement('video');
localVideo.muted = true; 
const peers = {};

//Creates a video and audio stream
navigator.mediaDevices.getUserMedia({ // Asks for video and microphone permission on the browser
    video: true,
    audio: true
}).then(stream => { // Sets up the peer to peer connection and video streams
    addVideoStream(localVideo, stream, "client")

    //Establishes connection between clients, when getting called
    myPeer.on('call', call => {
        console.log('getting called...');
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            console.log("In call, pre add");
            addVideoStream(video, userVideoStream, call.peer);
        });
    });

    //Connects user to each other
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    });
});

//Disconnects users from each other
socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close();
});

//Error cather
myPeer.on('error', err =>{
    console.log('myPeer error: ' + err);
});

//Connects players to the right lobby
myPeer.on('open', id => {
    console.log('ja det er scuffed');
    clientPeerId = id;
    console.log("client id: " + id);
    socket.emit('joinRoom', ROOM_ID, id, idFlag);
});

//The helper function for connecting to new users
function connectToNewUser(userId, stream) {
    console.log('calling. ring ring ring');
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        console.log(userVideoStream);
        console.log("Er det her????");
        addVideoStream(video, userVideoStream, userId);
        let clientName = document.querySelector("div.videoDiv#idclient > p");
        socket.emit('changeName', clientName.innerText, clientPeerId);
    });
    call.on('close', () => {
        video.parentElement.remove();
    });

    peers[userId] = call;
}

//Creates videostream html element
function addVideoStream(video, stream, userId) {
    let scuffedFix = document.getElementById("id" + userId);
    console.log("Scuffed Fix: " + scuffedFix);
    if (scuffedFix != dontTouch) {
        console.log("Removing element");
        scuffedFix.remove();
    }
    let videoDiv = document.createElement("div");
    videoDiv.setAttribute("id", "id" + userId);
    videoDiv.classList.add("videoDiv");
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    video.setAttribute("id", "id" + userId);
    videoDiv.append(video);
    let userPara = document.createElement("p");
    userPara.setAttribute("id", 'userNamePara');
    userPara.innerText = 'Guest';
    videoDiv.append(userPara);
    videoGrid.append(videoDiv);
} 

//Changes the html page dynamically
socket.on('changeHTML', meme => {
    //Getting body and head elements
    let body = document.body;
    let head = document.getElementById("head");
    //Converts incomming data to a string, and splits it up, so it only has the contents of the body tag
    newMeme = String(meme);
    let splitMeme = newMeme.split('<body>')[1];
    splitMeme = splitMeme.split("</body>")[0];
    
    //Creates a copy of the video feed, so it isn't lost
    let videos = document.createElement("div");
    videos = document.getElementById("videos");
    //Removes the body
    body.remove();
    //Constructs new body based on the incomming data
    let newBody = document.createElement("body");
    newBody.innerHTML = splitMeme;
    head.after(newBody);
    //Inserts the videofeed
    let videoPlacement = document.getElementById("videoPlacement");
    videoPlacement.after(videos);

    //Gets the src of the script in the body tag
    let scriptPlaceholder = document.getElementById("pageScript");
    let src = scriptPlaceholder.getAttribute("src");
    
    //Creates a new script identical to the one in the body tag, and removes the old one
    //This is done because else the script won't be executed
    let pageScript = document.createElement("script");
    pageScript.src = src;
    pageScript.defer = true;
    scriptPlaceholder.remove();
    document.body.appendChild(pageScript);
});