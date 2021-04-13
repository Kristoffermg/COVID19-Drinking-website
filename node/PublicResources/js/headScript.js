const socket = io({path:'/node0/socket.io', transports: ["polling"], autoConnect: false});  
console.log("socket connected" + socket.connected);
if (!socket.connected) {
    console.log("Entered weirdass if statement");
    socket.connect();
}

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

navigator.mediaDevices.getUserMedia({ // Asks for video and microphone permission on the browser
    video: true,
    audio: true
}).then(stream => { // Sets up the peer to peer connection and video streams
    addVideoStream(localVideo, stream)

    myPeer.on('call', call => {
        console.log('getting called...');
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    });
});

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close();
});

myPeer.on('error', err =>{
    console.log('myPeer error: ' + err);
});

myPeer.on('open', id => {
    console.log('ja det er scuffed');
    socket.emit('joinRoom', ROOM_ID, id, idFlag);
});

function connectToNewUser(userId, stream) {
    console.log('calling. ring ring ring');
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
    call.on('close', () => {
        video.remove();
    });

    peers[userId] = call;
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
} 

socket.on('changeHTML', meme => {
    let body = document.body;
    let head = document.getElementById("head");
    newMeme = String(meme);
    let splitMeme = newMeme.split('<body>')[1];
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