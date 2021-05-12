//Establishes socket connection, using the Socket.IO API
const socket = io({path:'/node0/socket.io', transports: ["polling"], autoConnect: false});  
// console.log("socket connected" + socket.connected);
if (!socket.connected) {
    socket.connect();
}

//Requests backend socket id
socket.emit('getId');
const videoGrid = document.getElementById('video-grid');

socket.on('user-connected', userId => {
    connectToNewUser(userId, true, false);
});

socket.on('ringring', (answerID, otherUsersProfilePictureSet) => {
    connectToNewUser(answerID, false, otherUsersProfilePictureSet);
});

socket.on('user-disconnected', (disconnectID) => {
    let meme = document.querySelector("div.videoDiv#id" + disconnectID);
        meme.remove();
});

socket.on('getUserName', () => {
    let userName = [];
    userName = document.querySelector("div.videoDiv#id" + clientSocketId + " > p").innerText;
    socket.emit('getUserName', (userName));
});

socket.on('setTurnOrder', (mejerLives) => {
    let avatarArr = document.querySelectorAll('.videoDiv');
    let newArr = [];
    let livesPara;
    let tempAva;
    let vidGrid = document.getElementById('video-grid');

    for (let i = 0; i < mejerLives.length; i++) {
        for (let j = 0; j < avatarArr.length; j++) {
            if ('id' + mejerLives[i][0] == avatarArr[j].getAttribute('id')) {
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
});

//The helper function for connecting to new users
function connectToNewUser(userId, flag, othersProfilePictureSet) {
    let name;
    let check = document.querySelector("div.videoDiv#id" + clientSocketId);
    if (check == dontTouch || flag) {
        socket.emit('answerCall', userId);
        name = document.querySelector("div.videoDiv#id" + clientSocketId + " > p");
        socket.emit('changeName', name.innerText, clientSocketId);
    }
    const video = document.createElement('img');
    addVideoStream(video, userId, othersProfilePictureSet);
}

//Creates videostream html element
function addVideoStream(video, userId, othersProfilePictureSet) {
    let scuffedFix = document.getElementById("id" + userId);
    if (scuffedFix != dontTouch) {
        scuffedFix.remove();
    }
    let videoDiv = document.createElement("div");
    videoDiv.setAttribute("id", "id" + userId);
    videoDiv.classList.add("videoDiv");

    video.src = othersProfilePictureSet === true ? profilePictureBase64 : '../img/Dummy.png'; // skal være billede

    video.setAttribute("id", "id" + userId);
    video.classList.add('avatar');
    videoDiv.append(video);
    let userPara = document.createElement("p");
    userPara.setAttribute("id", 'userNamePara');
    userPara.innerText = 'Guest';
    videoDiv.append(userPara);
    videoGrid.append(videoDiv);
}

socket.on('saveUsersProfilePicture', profilePictureAsBase64 => {
    profilePictureBase64 = profilePictureAsBase64;
});

socket.on('changeUsersProfilePicture', (userId, profilePicture1) => {
    // profilePicturePlaceholder is a div that contains the username and profile picture for the individual user
    profilePictureBase64 = profilePicture1;
    let profilePicturePlaceholder = document.getElementById("id" + userId);
    if(profilePicture1 && profilePicturePlaceholder) {
        profilePicturePlaceholder.firstChild.setAttribute("src", profilePicture1);
    }
});

//Gets own socket id from backend
socket.on('getId', id => {
    clientSocketId = id;
    const videoLOCAL = document.createElement('img');
    addVideoStream(videoLOCAL, clientSocketId);
});

//Gets the roomID from the backend
socket.on('roomId', (roomId) => {
    idxd = document.URL.split("/Lobby/")[1];
    let lobbyUrl = document.getElementById("lobbyurl");

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
});

//Get's username from backend, so it can be updated on the site
socket.on('changeName', (name, userId, userSocketId) =>{
    let userPlace = document.getElementById("id"+userId);
    let check;
    
    if (userPlace == dontTouch) {
        userPlace = document.getElementById("id" + userSocketId);
        check = document.querySelector("div.videoDiv#id" + userSocketId + " > p");
    } else {
        check = document.querySelector("div.videoDiv#id" + userId + " > p");
    }

    check.innerText = name;
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