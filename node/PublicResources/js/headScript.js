//Establishes socket connection, using the Socket.IO API
const socket = io({path:'/node0/socket.io', transports: ["polling"], autoConnect: false});  
console.log("socket connected" + socket.connected);
if (!socket.connected) {
    console.log("Entered weirdass if statement");
    socket.connect();
}

//Requests backend socket id
socket.emit('getId');

//Setup for the videochat
const videoGrid = document.getElementById('video-grid');

let options = {
    host: "global.xirsys.net",
    path: "/_turn/covid19-drinking",
    method: "PUT",
    headers: {
        "Authorization": "Basic " + Buffer.from("kristoffergregersen:60c40830-a79a-11eb-aad9-0242ac150003").toString("base64"),
        "Content-Type": "application/json",
        "Content-Length": bodyString.length
    }
};

const myPeer = new Peer(options);

const localVideo = document.createElement('video');
localVideo.muted = true; 
const peers = {};

//Creates a video and audio stream
navigator.mediaDevices.getUserMedia({ // Asks for video and microphone permission on the browser
    video: true,
    audio: true
}).then(stream => { // Sets up the peer to peer connection and video streams
    addVideoStream(localVideo, stream, clientSocketId)

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
    // let clientDiv = document.getElementById("idclient");
    // console.log(clientDiv);
    // clientDiv.setAttribute("id", "id" + id);
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
        let clientName = document.querySelector("div.videoDiv#id" + clientSocketId + " > p");
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
    console.log(videoGrid);
    videoGrid.append(videoDiv);
    console.log("DONESO");
}

//Gets own socket id from backend
socket.on('getId', id => {
    clientSocketId = id;
    console.log('clientSocketId: ' + clientSocketId);
});

//Gets the roomID from the backend
socket.on('roomId', (roomId) => {
    idxd = document.URL.split("/Lobby/")[1];
    console.log("TEEEEEEEST: " + idxd);
    console.log("Enter RoomID Socket!");
    let lobbyUrl = document.getElementById("lobbyurl");
    
    console.log('backend roomid ' + roomId);
    console.log('idxd ' + idxd);

    if(idxd == "" || idxd == dontTouch){
        ROOM_ID = roomId;
        idFlag = true;
        if (lobbyUrl != dontTouch) lobbyUrl.value = document.URL + ROOM_ID;            
                
    }else{
        ROOM_ID = idxd;
        idFlag = false;
        if (lobbyUrl != dontTouch) lobbyUrl.value = document.URL;            
    }

    console.log('ROOOOOOOM ' + ROOM_ID);

    //ROOM_ID = roomId;
});

//Get's username from backend, so it can be updated on the site
socket.on('changeName', (name, userId, userSocketId) =>{
    let userPlace = document.getElementById("id"+userId);
    console.log("userId");
    console.log(userId);
    console.log(userPlace);
    let check;
    
    if (userPlace == dontTouch) {
        userPlace = document.getElementById("id" + userSocketId);
        console.log("userplace should be clien: " + userPlace);
        check = document.querySelector("div.videoDiv#id" + userSocketId + " > p");
    } else {
        check = document.querySelector("div.videoDiv#id" + userId + " > p");
        console.log("userplace should be non-client: " + userPlace);
    }
    console.log("Check: " + check);
    
    if (check != dontTouch) {
        check.remove();
    }
    console.log("User " + userId + "changed name to " + name);

    console.log("userplace should be whatever: " + userPlace);
    console.log(userPlace);
    if (userPlace != dontTouch) {
        let displayName = document.createElement("p");
        displayName.setAttribute("id", "userNamePara");
        displayName.innerText = name;
        userPlace.append(displayName);
    }
});

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