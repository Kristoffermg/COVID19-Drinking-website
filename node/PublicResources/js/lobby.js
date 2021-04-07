const socket = io({path:'/node0/socket.io', transports: ["polling"]});

const createLobby = document.getElementById("createLobby");
const lobbyURL = document.getElementById("lobbyurl");
const copyURL = document.getElementById("copyURL");
const usernameInput = document.getElementById("username");
const setUsername = document.getElementById("setUsername");

let logo = document.getElementById("navbar__logo");

const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer();
const localVideo = document.createElement('video')
localVideo.muted = true; 
const peers = {}

navigator.mediaDevices.getUserMedia({ // Asks for video and microphone permission on the browser
    video: true,
    audio: true
}).then(stream => { // Sets up the peer to peer connection and video streams
    addVideoStream(localVideo, stream)

    myPeer.on('call', call => {
        console.log('getting called...')
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    let trueId = document.URL.split("/Lobby/")[1];
    socket.emit('joinVideo', trueId, id);
})

// Calls the other peers
function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

// Takes in a stream and puts it into the video element
function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
} 

socket.emit("randomRoom");

socket.emit("joinRoom", id);
console.log(id);

function copyURLtest() {
    console.log("hell nah");
    lobbyURL.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand("copy");    
};

// Emits to the server side with the username (remember to make the input go through the cleaner function)
setUsername.addEventListener("click", () => {
    socket.emit("setUsername", {username: usernameInput.value});
});

logo.addEventListener("click", () => {
    socket.emit("debug");
});