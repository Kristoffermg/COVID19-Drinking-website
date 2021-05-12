//Establishes socket connection, using the Socket.IO API
const socket = io({path:'/socket.io', transports: ["polling"], autoConnect: false});  
console.log("socket connected" + socket.connected);
if (!socket.connected) {
    console.log("Entered weirdass if statement");
    socket.connect();
}

//Requests backend socket id
socket.emit('getId');
const videoGrid = document.getElementById('video-grid');

socket.on('user-connected', userId => {
    console.log('Enter user-connected');
    connectToNewUser(userId, true);
});

socket.on('ringring', answerID => {
    console.log('Enter ringring');
    connectToNewUser(answerID, false);
});

socket.on('debugGoBrrrr', () => {
    console.log("DEBUG GO BRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR");
});

socket.on('user-disconnected', (disconnectID) => {
    let meme = document.querySelector("div.videoDiv#id" + disconnectID);
        meme.remove();
});

socket.on('getUserName', () => {
    let userName = [];
    console.log('getUserName');
    userName = document.querySelector("div.videoDiv#id" + clientSocketId + " > p").innerText;
    //userName = document.getElementById('userNamePara');
    console.log(userName);
    socket.emit('getUserName', (userName));
});

socket.on('setTurnOrder', (mejerLives) => {
    let avatarArr = document.querySelectorAll('.videoDiv');
    let newArr = [];
    let livesPara;
    let tempAva;
    let vidGrid = document.getElementById('video-grid');
    console.log('TURN ORDER START!!!!!!!');
    console.log(avatarArr);

    for (let i = 0; i < mejerLives.length; i++) {
        for (let j = 0; j < avatarArr.length; j++) {
            if ('id' + mejerLives[i][0] == avatarArr[j].getAttribute('id')) {
                //console.log('Player: ' + avatarArr[j].getAttribute('id'));
                tempAva = document.createElement('div');
                tempAva = avatarArr[j];
                newArr.push(tempAva);
            }
        }
    }

    for (let i = 0; i < avatarArr.length; i++) {
        avatarArr[i].remove();
    }

    for (let i = 0; i < newArr.length; i++) {
        livesPara = document.createElement('p');
        livesPara.innerText = 'lives: ' + mejerLives[0][1];
        livesPara.setAttribute('id', 'userNamePara');
        newArr[i].childNodes[0].style.outlineColor = 'grey';
        newArr[i].append(livesPara);
        vidGrid.append(newArr[i]);
    }
    newArr[0].childNodes[0].style.outlineColor = 'green';
    console.log(newArr);
    console.log('TURN ORDER END!!!!!!!');


    // socket.emit('dontMindMe');

});

//Setup for the videochat
// const videoGrid = document.getElementById('video-grid');
// const myPeer = new Peer({
//     pingInterval: 2000,
//     config: {'iceServers': [
//       { url: 'stun:stun.l.google.com:19302'},
//       { url: 'turn:turn.bistri.com:80', credential: 'homeo', username: 'homeo'}
//     ]} 
//   });
// const localVideo = document.createElement('video');
// localVideo.muted = true; 
// const peers = {};

//Creates a video and audio stream
// navigator.mediaDevices.getUserMedia({ // Asks for video and microphone permission on the browser
//     video: true,
//     audio: true
// }).then(stream => { // Sets up the peer to peer connection and video streams
//     addVideoStream(localVideo, stream, clientSocketId)

//     //Establishes connection between clients, when getting called
//     myPeer.on('call', call => {
//         console.log('getting called...');
//         call.answer(stream);
//         const video = document.createElement('video');
//         call.on('stream', userVideoStream => {
//             console.log("In call, pre add");
//             addVideoStream(video, userVideoStream, call.peer);
//         });
//     });

//     //Connects user to each other
//     socket.on('user-connected', userId => {
//         connectToNewUser(userId, stream);
//     });
// });

//Disconnects users from each other
// socket.on('user-disconnected', userId => {
//     if (peers[userId]) peers[userId].close();
// });

//Error cather
// myPeer.on('error', err =>{
//     console.log('myPeer error: ' + err);
// });

//Connects players to the right lobby
// myPeer.on('open', id => {
//     console.log('ja det er scuffed');
//     clientPeerId = id;
//     console.log("client id: " + id);
//     // let clientDiv = document.getElementById("idclient");
//     // console.log(clientDiv);
//     // clientDiv.setAttribute("id", "id" + id);
//     
// });

//The helper function for connecting to new users
function connectToNewUser(userId, flag) {
    let name;
    console.log('calling. ring ring ring');
    let check = document.querySelector("div.videoDiv#id" + clientSocketId);
    console.log('flagSmile: ' + flag);
    if (check == dontTouch || flag) {
        socket.emit('answerCall', userId);
        name = document.querySelector("div.videoDiv#id" + clientSocketId + " > p");
        console.log("name: " + name.innerText);
        socket.emit('changeName', name.innerText, clientSocketId);
    }
    console.log('post myPeer.call!!!!!');
    const video = document.createElement('img');
    addVideoStream(video, userId);

    // peers[userId] = call;
}

//Creates videostream html element
function addVideoStream(video, userId) {
    let scuffedFix = document.getElementById("id" + userId);
    console.log("Scuffed Fix: " + scuffedFix);
    if (scuffedFix != dontTouch) {
        console.log("Removing element");
        scuffedFix.remove();
    }
    let videoDiv = document.createElement("div");
    videoDiv.setAttribute("id", "id" + userId);
    videoDiv.classList.add("videoDiv");

    video.src = '../img/avatar.png'; // skal være billede
    

    video.setAttribute("id", "id" + userId);
    video.classList.add('avatar');
    videoDiv.append(video);
    let userPara = document.createElement("p");
    userPara.setAttribute("id", 'userNamePara');
    userPara.innerText = 'Guest';
    videoDiv.append(userPara);
    //console.log(videoGrid);
    videoGrid.append(videoDiv);
    console.log("DONESO");
}

socket.on('changeUsersProfilePicture', userId => {
    // profilePicturePlaceholder is a div that contains the username and profile picture for the individual user
    let profilePicturePlaceholder = document.getElementById("id" + userId);
    let profilePicture = localStorage.getItem(userId);
    if(profilePicture) {
        profilePicturePlaceholder.firstChild.setAttribute("src", profilePicture);
    }
});

//Gets own socket id from backend
socket.on('getId', id => {
    clientSocketId = id;
    console.log('clientSocketId: ' + clientSocketId);
    const videoLOCAL = document.createElement('img');
    addVideoStream(videoLOCAL, clientSocketId);
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

    socket.emit('joinRoom', ROOM_ID, idFlag);
    console.log('ROOOOOOOM ' + ROOM_ID);

    //ROOM_ID = roomId
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
socket.on('changeHTML', meme=> {
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

// socket.on('disconnect', (reason) => {
//     console.log('YOU HAS DISCONNECTED!!!!!');
//     console.log(reason);
// });