// Establishes socket connection, using the Socket.IO API
const socket = io({path:'/node0/socket.io', transports: ["polling"], autoConnect: false});  

if (!socket.connected) {
    socket.connect();
}

// Requests backend socket id
socket.emit('getId');
const profilePictureGrid = document.getElementById('profile-picture-grid');

socket.on('user-connected', userId => {
    connectToNewUser(userId, true, false);
});

socket.on('callOtherUsers', (answerID, otherUsersProfilePictureSet, profilePictureAsBase64) => {
    profilePictureBase64 = profilePictureAsBase64;
    connectToNewUser(answerID, false, otherUsersProfilePictureSet);
});

socket.on('user-disconnected', disconnectID => {
    // userBox is the front-end display of the user (profile picture and username)
    let userBox = document.querySelector("div.profilePictureGrid#id" + disconnectID);
    userBox.remove();
});

socket.on('getUserName', () => {
    let userName = [];
    userName = document.querySelector("div.profilePictureGrid#id" + clientSocketId + " > p").innerText;
    socket.emit('getUserName', userName);
});

socket.on('setTurnOrder', (mejerLives) => {
    let avatarArr = document.querySelectorAll('.profilePictureGrid');
    let newArr = [];
    let LivesParagraph;
    let tempAvatar;
    let profilePictureGrid = document.getElementById('profile-picture-grid');

    for (let i = 0; i < mejerLives.length; i++) {
        for (let j = 0; j < avatarArr.length; j++) {
            if ('id' + mejerLives[i][0] == avatarArr[j].getAttribute('id')) {
                tempAvatar = document.createElement('div');
                tempAvatar = avatarArr[j];
                newArr.push(tempAvatar);
            }
        }
    }

    for (let i = 0; i < avatarArr.length; i++) {
        avatarArr[i].remove();
    }

    for (let i = 0; i < newArr.length; i++) {
        LivesParagraph = document.createElement('p');
        LivesParagraph.innerText = 'lives: ' + mejerLives[0][1];
        LivesParagraph.setAttribute('id', 'userNamePara');
        newArr[i].childNodes[0].style.outlineColor = 'grey';
        newArr[i].append(LivesParagraph);
        profilePictureGrid.append(newArr[i]);
    }
    newArr[0].childNodes[0].style.outlineColor = 'green';
});

// The helper function for connecting to new users
function connectToNewUser(userId, flag, othersProfilePictureSet) {
    let name;
    let check = document.querySelector("div.profilePictureGrid#id" + clientSocketId);
    if (check == dontTouch || flag) {
        console.log(userId);
        socket.emit('answerCall', userId);
        name = document.querySelector("div.profilePictureGrid#id" + clientSocketId + " > p");
        socket.emit('changeName', name.innerText, clientSocketId);
    }
    const profilePicture = document.createElement('img');
    
    addVideoStream(profilePicture, userId, othersProfilePictureSet);
}

// Creates videostream html element
function addVideoStream(profilePicture, userId, othersProfilePictureSet) {
    let scuffedFix = document.getElementById("id" + userId);
    if (scuffedFix != dontTouch) {
        scuffedFix.remove();
    }
    let profilePictureGrid = document.createElement("div");
    profilePictureGrid.setAttribute("id", "id" + userId);
    profilePictureGrid.classList.add("profilePictureGrid");

    profilePicture.src = othersProfilePictureSet === true ? profilePictureBase64 : '../img/avatar.png'; // skal være billede

    profilePicture.setAttribute("id", "id" + userId);
    profilePicture.classList.add('avatar');
    profilePictureGrid.append(video);

    let userParagraph = document.createElement("p");
    userParagrah.setAttribute("id", 'userNamePara');
    userParagraph.innerText = 'Guest';

    profilePictureGrid.append(userParagraph);
    profilePictureGrid.append(profilePictureGrid);
}

socket.on('changeUsersProfilePicture', (userId, profilePicture) => {
    // profilePicturePlaceholder is a div that contains the username and profile picture for the individual user
    profilePictureBase64 = profilePicture;
    let profilePicturePlaceholder = document.getElementById("id" + userId);
    if(profilePicture && profilePicturePlaceholder) {
        profilePicturePlaceholder.firstChild.setAttribute("src", profilePicture);
    }
});

// Gets own socket id from backend
socket.on('getId', id => {
    clientSocketId = id;
    const profilePictureLOCAL = document.createElement('img');
    addVideoStream(profilePictureLOCAL, clientSocketId, false);
});

// Gets the roomID from the backend
socket.on('roomId', (roomId) => {
    idxd = document.URL.split("/Lobby/")[1];
    let lobbyUrl = document.getElementById("lobbyurl");

    if(idxd == "" || idxd == dontTouch){
        ROOM_ID = roomId;
        shouldCreateRoom = true;
        if (lobbyUrl != dontTouch) lobbyUrl.value = document.URL + ROOM_ID;            
                
    }else{
        ROOM_ID = idxd;
        shouldCreateRoom = false;
        if (lobbyUrl != dontTouch) lobbyUrl.value = document.URL;            
    }

    socket.emit('joinRoom', ROOM_ID, shouldCreateRoom);
});

// Gets username from backend, so it can be updated on the site
socket.on('changeName', (name, userId, userSocketId) =>{
    let userBox = document.getElementById("id" + userId);
    let usernameElement;
    
    if (userBox == dontTouch) {
        userBox = document.getElementById("id" + userSocketId);
        usernameElement = document.querySelector("div.profilePictureGrid#id" + userSocketId + " > p");
    } else {
        usernameElement = document.querySelector("div.profilePictureGrid#id" + userId + " > p");
    }

    usernameElement.innerText = name;
});

// Changes the html page dynamically
socket.on('changeHTML', htmlData => {
    // Getting body and head elements
    let body = document.body;
    let head = document.getElementById("head");
    // Converts incomming data to a string, and splits it up, so it only has the contents of the body tag
    htmlText = String(htmlData);
    let bodyHTML = htmlText.split('<body>')[1];
    bodyHTML = bodyHTML.split("</body>")[0];
    
    // Creates a copy of the video feed, so it isn't lost
    let profilePictures = document.createElement("div");
    profilePictures = document.getElementById("videos");

    body.remove();

    // Constructs new body based on the incomming data
    let newBody = document.createElement("body");
    newBody.innerHTML = bodyHTML;
    head.after(newBody);

    // Inserts the videofeed
    let videoPlacement = document.getElementById("videoPlacement");
    videoPlacement.after(profilePictures);

    // Gets the src of the script in the body tag
    let scriptPlaceholder = document.getElementById("pageScript");
    let src = scriptPlaceholder.getAttribute("src");
    
    // Creates a new script identical to the one in the body tag, and removes the old one
    // This is done because else the script won't be executed
    let pageScript = document.createElement("script");
    pageScript.src = src;
    pageScript.defer = true;
    scriptPlaceholder.remove();
    document.body.appendChild(pageScript);
});