const socket = io({path:'/node0/socket.io', transports: ["polling"]});

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

let dontTouch;
let ROOM_ID;
let idFlag;

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


socket.on('roomId', (roomId) => {

    console.log('backend roomid ' + roomId);
    console.log('idxd ' + idxd);

    if(idxd == "" || idxd == dontTouch){
        ROOM_ID = roomId;
        idFlag = true;
    }else{
        ROOM_ID = idxd;
        idFlag = false;
    }

    console.log('ROOOOOOOM ' + ROOM_ID);

    //ROOM_ID = roomId;
});



let idxd = document.URL.split("/Lobby/")[1];
let logo = document.getElementById("navbar__logo");

//socket.emit("joinRoom", idxd);


socket.on('changeName', name =>{
    console.log("Username: " + socket.userName);
})

logo.addEventListener("click", () => {
    socket.emit("debug");
});