const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const pathApi = require('path');
const fs = require('fs');
const mysql = require('mysql');

const io = require('socket.io')(server, {
    pingInterval: 1000,
    pingTimeout: 1000,
    cors: {
        origin: "*"
    }
});

const hostname = '127.0.0.1';
const port = 3100;

// Handling of HTML files
const path = `${__dirname}/PublicResources`;
console.log(path);

app.use(express.static(path));

const con = mysql.createConnection({
    host: "localhost",
    database: "sw2b2_3",
    user: "sw2b2-3",
    password: "wFGUZekJjvX7CVYn"
}); 

con.connect(function(err) {
    if(err) console.log("Error connecting to database: Either the database is down or you're on localhost.");
    else console.log("Connected to database established.");
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/PublicResources/html/index.html');
});

app.get('/Lobby', function(req, res) {
    res.sendFile(__dirname + '/PublicResources/html/createlobby.html');
});

app.get('/Lobby/:lobbyId', function(req, res) {
    let lobbyId = req.params.lobbyId;
    let fileSent = false;
    console.log(lobbyId);
    if (idArr.length <= 0) {
        console.log("No rooms exist");
        res.sendFile(pathApi.join(__dirname + '/PublicResources/html/error.html'));
    }

    for (let i = 0; i < idArr.length; i++) {
        if (idArr[i].roomId == lobbyId) {
            let htmlPath;
            switch (idArr[i].startedGame) {
                case 'prompt':
                    htmlPath = '/PublicResources/html/never.html';
                    break;
                case 'dice':
                    htmlPath = '/PublicResources/html/Meyer.html'; 
                    break;
                default:
                    htmlPath = '/PublicResources/html/createlobby.html';
                    break;
            }

            res.sendFile(__dirname + htmlPath);
            fileSent = true;
        }
    }

    if (!fileSent) {
        console.log("Else in switch");
        res.sendFile(pathApi.join(__dirname + '/PublicResources/html/error.html'));
    }
});

app.get('/GamesAndRules', function(req, res) {
    res.sendFile(__dirname + '/PublicResources/html/gamesAndRules.html');
});
    
io.on('connect_error', (err) => {
    console.log('Socket connection error: ' + err);
});

// Constructer function for room objects
function idObj(roomId, amountConnected) {
    this.roomId = roomId;
    this.amountConnected = amountConnected;
    this.userIdArr = [];
    this.customProfilePictureSet = [];
    this.startedGame = 'none';
    this.customPrompts = [];
    this.roundtimeValue = 0;

    this.neverGame = function NeverObj(neverPrompts) {
        this.amountOfSipsRule = "";
        this.useCustomPromptsExclusively = false;
        this.neverHaveIEverPrompts = neverPrompts;
        this.usedPrompts = [];
        this.counter = 0;
        this.voteCount = 0;
        this.votingRight = 0;
        this.answerArr = [];
    }

    this.meyer = function meyerObj(ranks) {
        this.lastRoll = [0,0];
        this.rollToBeat = [0,0];
        this.lieRoll = [0,0];
        this.wasLastLie = false;
        this.wasLastDerOver = false;
        this.meyerRanks = ranks;
        this.currTurn = 0;
        this.meyerLives = [];
    }
    
}

//Don't Touch :)
let dontTouch;
let dontTouchTwo;

let idBase;

let idArr = [];

// All the socket functions
io.on('connection', (socket) => {
    console.log(socket.userName + " has connected.");

    // Leaves own id-room
    console.log(socket.rooms);

    //Jeg ander ikk hvad der sker her, men det er nok vigtigt
    if(dontTouchTwo == dontTouch){
        dontTouchTwo = socket.rooms;
    }

    // Generates a random base64 string, which is used as the room id
    do {
        let i = Math.random();
        idBase = "roomId-" + Buffer.from(`${i}`).toString('base64');
    } while (idArr.includes(idBase));
    socket.emit('roomId', idBase);

    // Gives the id of the socket to the client
    socket.on('getId', () => {
        socket.emit('getId', socket.id);
    });

    // Changes the username of the user who requested it
    socket.on('changeName', (name) => {
        socket.userName = name;
        io.to(socket.room).emit('changeName', socket.userName, socket.id);
    });

    // Chat function
    socket.on('newMessage', ({msg, id}) => {
        console.log("message: " + msg);
        console.log("room id: " + id);

        io.to(id).emit('message', `${socket.userName} said: ${msg}` );
    });

    // Joins an existing room based on the url, or creates one if nessesary
    socket.on('joinRoom', (roomId, shouldCreateRoom) => {
        var d2 = new Date();
        console.log("");
        console.log(d2.toLocaleTimeString() + '  ' + d2.toLocaleDateString());
        socket.admin = false;
        if (shouldCreateRoom) {
            randomRoom(socket, roomId);
        } else {
            socket.join(roomId);
            socket.room = roomId;
            socket.emit('deleteAdminStuff');
            console.log("User joined room " + socket.room);
        }

        for (let i = 0; i < idArr.length; i++) {
            if (idArr[i].roomId == socket.room) {
                idArr[i].amountConnected++;
                idArr[i].userIdArr.push(socket.id);
                if (idArr[i].amountConnected == 1) {
                    socket.admin = true;
                    socket.emit('makeAdmin');
                }
            }
        }

        socket.to(roomId).broadcast.emit("user-connected", socket.id);
        
        socket.on('disconnect', () => {
            deleteUsersProfilePicture(socket.id);
            socket.to(roomId).broadcast.emit('user-disconnected', socket.id);
        });
    });

    socket.on('answerCall', (callerID) => {
        let roomId = getRoomID(socket), 
            userId = getUserID(socket);
        if(idArr[roomId].customProfilePictureSet[userId]) {
            getUsersProfilePicture(socket.id, callerID, roomId, userId);
        } else {
            io.to(callerID).emit('callOtherUsers', socket.id, idArr[roomId].customProfilePictureSet[userId], "");
        }
    });

    // Decides what html page the send to dynamically send to the frontend, based on user input 
    socket.on('startGame', (gameType, amountOfSips, roundtime, _useCustomPromptsExclusively, meyerLifeAmount) => {
        let id;
        if (!socket.admin) {
            socket.emit('noAdminPerm');
        } else {
            let htmlPath;
            switch (gameType) {
                case 'prompt':
                    console.log("Prompt game chosen");
                    //Throw prompt html
                    htmlPath = '/PublicResources/html/never.html';
                    //Initialize 'Never have I ever' variables
                    for (let i = 0; i < idArr.length; i++) {
                        if (idArr[i].roomId == socket.room) {
                            id = i;
                            idArr[i].startedGame = gameType;
                            fs.readFile(__dirname + "/MiscFiles/NeverPrompts.txt", "utf8", function(err, data) {
                                if (err) throw err;
                            
                                let neverHaveIEverPrompts = data.split(/\r?\n/);
                                idArr[i].neverGame(neverHaveIEverPrompts);
                                idArr[i].amountOfSipsRule = amountOfSips;

                                idArr[id].useCustomPromptsExclusively = _useCustomPromptsExclusively;
                                if(_useCustomPromptsExclusively === false) {
                                    mixCustomAndWrittenPrompts(id);
                                }
                            });
                        }
                    }

                    switch(roundtime) {
                        case '1s':
                            idArr[id].roundtimeValue = 1;
                            break;
                        case '10s':
                            idArr[id].roundtimeValue = 10;
                            break;
                        case '15s':
                            idArr[id].roundtimeValue = 15;
                            break;
                        case '30s':
                            idArr[id].roundtimeValue = 30;
                            break;
                    }
                    break;
    
                case 'dice':
                    console.log("Dice game chosen");
                    //Throw dice html
                    htmlPath = '/PublicResources/html/Meyer.html'; 
                    
                    for (let i = 0; i < idArr.length; i++) {
                        if (idArr[i].roomId == socket.room) {
                            idArr[i].startedGame = gameType;
                            fs.readFile(__dirname + "/MiscFiles/meyerRanks.txt", "utf8", function(err, data) {
                                if (err) throw err;

                                let meyerRanks = data.split(/\r?\n/);
                                for (let i = 0; i < meyerRanks.length; i++) {
                                    meyerRanks[i] = meyerRanks[i].split(',');
                                }
                                idArr[i].meyer(meyerRanks);
                                if(meyerLifeAmount < 1){
                                    meyerLifeAmount = 1;
                                } else if(meyerLifeAmount > 99){
                                    meyerLifeAmount = 99;
                                }
                                meyerLivesSetup(i, meyerLifeAmount);
                            });
                        }
                    }
                    break;
    
                default:
                    console.log("shit broke");
                    htmlPath = '/PublicResources/html/error.html';
                    break;
            }

            // Reads the relevant html file, and sends it to the frontend
            fs.readFile(__dirname + `${htmlPath}`, 'utf8', function(err, data) {
                io.to(socket.room).emit('changeHTML', data);
            });
        }
    });

    socket.on('quitToLobby', () => {
        fs.readFile(__dirname + `/PublicResources/html/createlobby.html`, 'utf8', function(err, data) {
            if (err) throw err;
            io.to(socket.room).emit('changeHTML', data);
        });
    });

    socket.on('userChangedProfilePicture', (userId, profilePicture) => {
        insertProfilePictureIntoDatabase(socket, profilePicture);
        io.to(socket.room).emit('changeUsersProfilePicture', userId, profilePicture)

        let userArrId = getUserID(socket),
            roomId = getRoomID(socket);

        idArr[roomId].customProfilePictureSet[userArrId] = true;
    });

    // Handles 'Never have I ever' game logic
    socket.on('neverLogic', firstTurn => {
        let id, prompt;
        for(let i = 0; i < idArr.length; i++) {
            if(idArr[i].roomId === socket.room) {
                id = i;
            }
        }
        io.to(socket.room).emit("setRoundtime", idArr[id].roundtimeValue);
        io.to(socket.room).emit('setSipText', idArr[id].amountOfSipsRule);
        idArr[id].voteCount++;
        idArr[id].votingRight = idArr[id].amountConnected;
        io.to(socket.room).emit('voting', idArr[id].voteCount, idArr[id].votingRight, firstTurn);

        if ((idArr[id].voteCount >= (idArr[id].votingRight / 2)) || firstTurn) {
            if(unusedPromptsLeft(id)) {
                let randomPromptIndex = randomPrompt(id);
                idArr[id].usedPrompts[idArr[id].counter] = randomPromptIndex;
                idArr[id].counter++;
                if(idArr[id].useCustomPromptsExclusively === false) {
                    prompt = idArr[id].neverHaveIEverPrompts[randomPromptIndex];
                } else {
                    prompt = idArr[id].customPrompts[randomPromptIndex];
                }
                io.to(socket.room).emit("nextPrompt", prompt);
                countdown(idArr[id].nextPromptCountdown, socket, id);
                idArr[id].voteCount = 0;
            } else {
                io.to(socket.room).emit("gameOver"); 
            }
        }
    });

    socket.on('neverAnswer', (answer) => {
        let tempArray = [];

        tempArray[0] = socket.id;
        tempArray[1] = answer;

        for(i = 0; i < idArr.length; i++){
            if(idArr[i].roomId == socket.room){
                idArr[i].answerArr.push(tempArray);
            }
        }
    });

    //---------------------------MEYER FUNCTIONS----------------------------
    socket.on('meyerFirstTurn', () => {
        let id = findID(socket.room);
        io.to(idArr[id].meyerLives[0][0]).emit('firstTurn');

        io.to(idArr[id].roomId).emit('getUserName');
        io.to(idArr[id].roomId).emit('setTurnOrder', idArr[id].meyerLives);
    });

    socket.on('turnIndicator', turnStart => {
        let id = findID(socket.room);
        if (turnStart) {
            io.to(idArr[id].roomId).emit('turnIndicator', idArr[id].meyerLives[idArr[id].currTurn][0], idArr[id].meyerLives, turnStart);
        } else {
            io.to(idArr[id].roomId).emit('turnIndicator', socket.id, idArr[id].meyerLives, turnStart);
        }

    });

    socket.on('meyerRoll', () => {
        let dice1 = Math.floor(Math.random() * 6) + 1;
        let dice2 = Math.floor(Math.random() * 6) + 1;
        let id = findID(socket.room);

        if(idArr[id].wasLastLie){
            idArr[id].rollToBeat = idArr[id].lieRoll;
        }else{
            if(!idArr[id].wasLastDerOver){
                idArr[id].rollToBeat = idArr[id].lastRoll;
            }
        }

        idArr[id].lastRoll = diceSort(dice1, dice2);
        
        if(checkDrink(idArr[id].lastRoll)){
            io.to(socket.room).emit('everyoneDrink');
            io.to(socket.room).emit('updateGameLog', `32! Everyone drink!`);
            idArr[id].rollToBeat = [0,0];
            idArr[id].lastRoll = [0,0];
            idArr[id].lieRoll = [0,0];
            idArr[id].wasLastLie = false;
        
            if(idArr[id].currTurn == 0){
                idArr[id].currTurn = idArr[id].meyerLives.length - 1;
            }else{
                idArr[id].currTurn--;
            }

            nextTurn(id);
            
        } else {
            socket.emit("meyerRoll", idArr[id].lastRoll);
        }
    });

    socket.on('meyerTrue', () => {
        let id = findID(socket.room);
        let screenName;

        for (let i = 0; i < idArr[id].meyerLives.length; i++) {
            if (idArr[id].meyerLives[i][0] == socket.id) {
                screenName = idArr[id].meyerLives[i][2];
            }
        }


        if(!compareRoll(idArr[id].lastRoll, idArr[id].rollToBeat, id)){
            socket.emit('trueError');
        }else{
            nextTurn(id);
            socket.emit('notYourTurn');

            let result = (String(idArr[id].lastRoll[0]) + String(idArr[id].lastRoll[1]));

            io.to(socket.room).emit('incomingRoll', result);

            idArr[id].wasLastLie = false;
            idArr[id].wasLastDerOver = false;

            io.to(socket.room).emit('updateGameLog', `${screenName} rolled '${result}'`);
        }

    });

    socket.on('meyerLie', (dice1, dice2) => { // duplicate
        let id = findID(socket.room);
        let screenName;

        for (let i = 0; i < idArr[id].meyerLives.length; i++) {
            if (idArr[id].meyerLives[i][0] == socket.id) {
                screenName = idArr[id].meyerLives[i][2];
            }
        }
        
        idArr[id].lieRoll = diceSort(dice1, dice2);

        if(!compareRoll(idArr[id].lieRoll, idArr[id].rollToBeat, id)){
            socket.emit('lieError');
        } else{
            nextTurn(id);
            socket.emit('notYourTurn');

            let result = (String(idArr[id].lieRoll[0]) + String(idArr[id].lieRoll[1]));

            io.to(socket.room).emit('incomingRoll', result);

            idArr[id].wasLastLie = true;
            idArr[id].wasLastDerOver = false;

            io.to(socket.room).emit('updateGameLog', `${screenName} rolled '${result}'`);
        }
    });

    socket.on('meyerDerover', () => { 
        // duplicate ----
        let id = findID(socket.room);
        let screenName;

        for (let i = 0; i < idArr[id].meyerLives.length; i++) {
            if (idArr[id].meyerLives[i][0] == socket.id) {
                screenName = idArr[id].meyerLives[i][2];
            }
        }
        // -----

        let dice1 = Math.floor(Math.random() * 6) + 1;
        let dice2 = Math.floor(Math.random() * 6) + 1;
        
        idArr[id].lastRoll = diceSort(dice1, dice2);
        idArr[id].wasLastLie = false;
        idArr[id].wasLastDerOver = true;

        nextTurn(id);
        socket.emit('notYourTurn');

        io.to(socket.room).emit('incomingRoll', 'Same or higher');
        io.to(socket.room).emit('updateGameLog', `${screenName} rolled 'Same or higher`);

    });

    socket.on('meyerLift', () => {
        let id = findID(socket.room);
        let loser;

        if(idArr[id].wasLastLie){
            // He whom lifted won
            for(let i = 0; i < idArr[id].meyerLives.length; i++){
                if(idArr[id].meyerLives[i][0] == socket.id){

                    if(i == 0){
                        i = idArr[id].meyerLives.length - 1;
                    } else{
                        i--;
                    }

                    meyerLivesDecrement(idArr[id].meyerLives[i][0], id);
                    loser = idArr[id].meyerLives[i][0];
                    for(let j = 0; j < 2; j++){
                        if(idArr[id].currTurn == 0){
                            idArr[id].currTurn = idArr[id].meyerLives.length - 1;
                        } else{
                            idArr[id].currTurn--;
                        }
                    }
                    socket.emit('notYourTurn');
                    nextTurn(id);
                    io.to(idArr[id].meyerLives[idArr[id].currTurn][0]).emit('startOfNewRound');
                    break;
                }
            }
        } else{
            if (checkDrink(idArr[id].lastRoll)) {
                io.to(socket.room).emit('everyoneDrink');
                io.to(socket.room).emit('updateGameLog', `32! Everyone drink!`);
                idArr[id].rollToBeat = [0,0];
                idArr[id].lastRoll = [0,0];
                idArr[id].lieRoll = [0,0];
                idArr[id].wasLastLie = false;
            
                if(idArr[id].currTurn == 0){
                    idArr[id].currTurn = idArr[id].meyerLives.length-1;
                }else{
                    idArr[id].currTurn--;
                }
    
                nextTurn(id);

            } else if(!compareRoll(idArr[id].lastRoll, idArr[id].rollToBeat, id)){
                
                for(let i = 0; i < idArr[id].meyerLives.length; i++){
                    if(idArr[id].meyerLives[i][0] == socket.id){

    
                        if(i == 0){
                            i = idArr[id].meyerLives.length-1;
                        }else{
                            i--;
                        }
    
                        meyerLivesDecrement(idArr[id].meyerLives[i][0], id);
                        loser = idArr[id].meyerLives[i][0];
                        if(idArr[id].lastRoll[0] == 1 && idArr[id].lastRoll[1] == 2){
                            meyerLivesDecrement(idArr[id].meyerLives[i][0], id);
                        }

    
                        for(let j = 0; j < 2; j++){
    
                            if(idArr[id].currTurn == 0){
                                idArr[id].currTurn = idArr[id].meyerLives.length-1;
                            }else{
                                idArr[id].currTurn--;
                            }
                        }
                        socket.emit('notYourTurn');
                        nextTurn(id);
                        io.to(idArr[id].meyerLives[idArr[id].currTurn][0]).emit('startOfNewRound');
                        break;
                    }
                }


            } else {
                meyerLivesDecrement(socket.id, id);
                loser = socket.id;
                if(idArr[id].lastRoll[0] == 1 && idArr[id].lastRoll[1] == 2){
                    meyerLivesDecrement(idArr[id].meyerLives[i][0], id);
                }
    
                if(idArr[id].currTurn == 0){
                    idArr[id].currTurn = idArr[id].meyerLives.length-1;
                }else{
                    idArr[id].currTurn--;
                }
    
                nextTurn(id);
                io.to(idArr[id].meyerLives[idArr[id].currTurn][0]).emit('startOfNewRound');
            }
        }

        let screenName = findScreenName(id, socket.id);
        let screenNameTwo;

        for(let k = 0; k < idArr[id].meyerLives.length; k++){
            if(idArr[id].meyerLives[k][0] == socket.id){
                if (k == 0) {
                    screenNameTwo = findScreenName(id, idArr[id].meyerLives[idArr[id].meyerLives.length - 1][0]);
                } else {
                    screenNameTwo = findScreenName(id, idArr[id].meyerLives[k-1][0]);                                
                }
            }
        }
        io.to(idArr[id].roomId).emit('loseLife', loser, `${screenNameTwo} rolled ${idArr[id].lastRoll[0]}${idArr[id].lastRoll[1]} and ${screenName} lifted`);
        
        idArr[id].rollToBeat = [0,0];
        idArr[id].lastRoll = [0,0];
        idArr[id].lieRoll = [0,0];
        idArr[id].wasLastLie = false;

    });
    
    socket.on('updateGameLog', (str) => {
        io.to(socket.room).emit('updateGameLog', str);
    });

    socket.on('getUserName', (userName) => {
        let id = findID(socket.room);

        for(let i = 0; i < idArr[id].meyerLives.length; i++){
            if(socket.id == idArr[id].meyerLives[i][0]){
                idArr[id].meyerLives[i][2] = userName;
            }
        }
    });

    //-------------------------DICE FUNCTION END----------------------------

    socket.on('chatMessage', (message, userId) => {
        io.to(socket.room).emit('newMessage', message, userId);
    });

    socket.on('checkAdminStatus', () => {
        socket.emit('checkAdminStatus', socket.admin);
    });

    socket.on('makeAdmin', () => {
        socket.admin = true;
    });

    // Runs when socket disconnects from a room
    socket.on('disconnectRoom', roomId => {
        socket.leave(roomId);
        console.log("User left room " + roomId);
        disconnectHandler(socket);
    });

    // Runs when socket disconnects from server
    socket.on('disconnect', () => {
        console.log(socket.userName + " has disconnected.");
        io.emit('message', `${socket.userName} has disconnected`);
        disconnectHandler(socket);
    });

    socket.on('storeCustomPrompt', prompt => {
        let id = getRoomID(socket);
        idArr[id].customPrompts.push(prompt);
    });

    socket.on('deleteCustomPrompt', prompt => {
        let id = getRoomID(socket);
        let index = idArr[id].customPrompts.indexOf(prompt); // If index is -1 then customPrompts doesn't contain the prompt
        if(index > -1) {
            idArr[id].customPrompts.splice(index, 1);
        }
    });

    socket.on('insertProfilePictureQuery', profilePictureAsBase64 => {
        con.query("INSERT INTO ProfilePictures(userID, roomID, pfp) VALUES(?, ?, ?)", [
            socket.id,
            getRoomID(socket),
            profilePictureAsBase64
        ], function() {
            console.log(`${socket.id} profile picture inserted in room ${getRoomID(socket)}`);
        });
    });
});

function getRoomID(socket) {
    for(let i = 0; i < idArr.length; i++) {
        if(idArr[i].roomId === socket.room) {
            return i;
        }
    }
    return -1;
}

function getUserID(socket) {
    let roomId = getRoomID(socket);
    for(let i = 0; i < idArr[roomId].userIdArr.length; i++) {
        if (idArr[roomId].userIdArr[i] == socket.id) {
            return i;
        }
    }
    return -1;
}

function mixCustomAndWrittenPrompts(id) {
    for(let i = 0; i < idArr[id].customPrompts.length; i++) {
        idArr[id].neverHaveIEverPrompts.push(idArr[id].customPrompts[i])
    }
}

function insertProfilePictureIntoDatabase(socket, profilePictureAsBase64) {
    con.query("INSERT INTO ProfilePictures(userID, roomID, pfp) VALUES(?, ?, ?)", [
        socket.id,
        getRoomID(socket),
        profilePictureAsBase64
    ], function() {
        console.log(`${socket.id} profile picture inserted in room ${getRoomID(socket)}`);
    });
}

function getOtherUsersProfilePictureFromDatabase(userId) {
    return new Promise(function(resolve, reject) {
        con.query('SELECT pfp FROM ProfilePictures WHERE userId = ?', [userId], function(err, result) {
            if(result === undefined) {
                reject(new Error("Error: result is undefined"));
            } else {
                try {
                    resolve(result[0].pfp);
                } catch {
                    console.log("Error retrieving profile picture from the database.")
                }
            }
        }); 
    });
}

async function getUsersProfilePicture(socketId, callerID, roomId, userId) {
    const profilePictureBase64 = await getOtherUsersProfilePictureFromDatabase(socketId);
    if(profilePictureBase64  !== undefined) {
        io.to(callerID).emit('callOtherUsers', socketId, idArr[roomId].customProfilePictureSet[userId], profilePictureBase64);
    }
}

function deleteUsersProfilePicture(userId) {
    con.query("DELETE FROM ProfilePictures WHERE userId = ?", [
        userId,
    ], function() {
        console.log(`${userId} profile picture deleted`);
    });
}

// Changes the idArr and removes a room object, if it has no user in it
function disconnectHandler (socket) {
    if(socket.rooms !== dontTouchTwo){
	    for(let i = 0; i < idArr.length; i++){
	        for(let j = 0; j < idArr[i].userIdArr.length; j++) {
	            if (idArr[i].userIdArr[j] == socket.id) {
                    idArr[i].amountConnected--;
                    delete idArr[i].userIdArr[j];
                    pushArray(idArr[i].userIdArr, j);
                    idArr[i].userIdArr.pop();
                    if (socket.admin) {
                        console.log("UserIdArr:");
                        console.log(idArr[i].userIdArr);
                        let newAdmin = Math.floor(Math.random() * (idArr[0].userIdArr.length));
                        io.to(idArr[i].userIdArr[newAdmin]).emit("makeAdmin");
                    }
                    break;
                }
	        }
	        if(idArr[i].amountConnected == 0){
                delete idArr[i];
                pushArray(idArr, i);
                idArr.pop();
                break;
	        }
	    }
	}
}

// Finds index of room in idArr
function findID(roomId){
    for (let i = 0; i < idArr.length; i++) {
        if (idArr[i].roomId == roomId) {
            return i;
        }
    }
}

function countdown(time, socket, id) {
    if(time > 0) {
        setTimeout(function() { countdown(--time, socket, id) }, 1000);
    } else {    
        io.to(socket.room).emit("activateNextRoundBtn");
        // Prevents server crash when refreshing the page and starting games over and over (answerArr undefined)
        try {
            io.to(socket.room).emit('revealAnswer', idArr[id].answerArr);
            idArr[id].answerArr = [];
        }
        catch(err) {
            console.log(err);
        }
    }
}

function unusedPromptsLeft(id) {
    let promptArrLength = idArr[id].useCustomPromptsExclusively === false ? idArr[id].neverHaveIEverPrompts.length : idArr[id].customPrompts.length;
    if(idArr[id].usedPrompts.length !== promptArrLength) {
        return true;
    }
    return false
}

function randomPrompt(id) {
    let randomPromptIndex;
    let promptArrLength = idArr[id].useCustomPromptsExclusively === false ? idArr[id].neverHaveIEverPrompts.length : idArr[id].customPrompts.length;
    do {
        randomPromptIndex = Math.floor(Math.random() * promptArrLength);
    } while(promptHasBeenUsed(randomPromptIndex, id));
    idArr[id].usedPrompts[idArr[id].counter] = randomPromptIndex;
    return randomPromptIndex;
}

function promptHasBeenUsed(randomPromptIndex, id) {
    if(idArr[id].usedPrompts.includes(randomPromptIndex)) {
      return true;
    }
    return false;
}

//---------------------------------DICE FUNCTIONS----------------------

function diceSort(dice1, dice2) {
    let tempArr = [dice1, dice2];

    if (dice1 < dice2) {
        tempArr = [dice2, dice1];
    }

    if ((tempArr[0] == 2 && tempArr[1] == 1) || (tempArr[0] == 3 && tempArr[1] == 1)) {
        tempArr.reverse();
    }

    return tempArr;
}

// Returns true if arrNew is a better roll than arrAgainst
function compareRoll(arrNew, arrAgainst, id) {
    let i;
    let j;

    for(i = 0; i < idArr[id].meyerRanks.length; i++){
        if(arrNew[0] == idArr[id].meyerRanks[i][0] && arrNew[1] == idArr[id].meyerRanks[i][1]) {
            break;
        }
    }

    for(j = 0; j < idArr[id].meyerRanks.length; j++){
        if(arrAgainst[0] == idArr[id].meyerRanks[j][0] && arrAgainst[1] == idArr[id].meyerRanks[j][1]) {
            break;
        }
    }

    if(i >= j){
        return true;
    } else {
        return false;
    }

}

function nextTurn(id) {
    if (idArr[id].currTurn < idArr[id].meyerLives.length - 1) {
        idArr[id].currTurn++;
    } else {
        idArr[id].currTurn = 0;
    }

    io.to(idArr[id].meyerLives[idArr[id].currTurn][0]).emit('clientTurn');
}

function meyerLivesSetup(id, lifeAmount){
    let tempArray = [];    

    for(let i = 0; i < idArr[id].userIdArr.length; i++){
        tempArray = [idArr[id].userIdArr[i], lifeAmount];
        idArr[id].meyerLives[i] = tempArray;
    }
}

function meyerLivesDecrement(playerID, roomID){
    let screenName;

    for(let i = 0; i < idArr[roomID].meyerLives.length; i++){
        if(playerID == idArr[roomID].meyerLives[i][0]){
            screenName = idArr[roomID].meyerLives[i][2];
            idArr[roomID].meyerLives[i][1]--;
            io.to(idArr[roomID].roomId).emit('updateGameLog', `${screenName} lost a life, and now has ${idArr[roomID].meyerLives[i][1]} left`);
            io.to(playerID).emit('drink');

            // If a user died (0 lives left)
            if(idArr[roomID].meyerLives[i][1] == 0){
                io.to(playerID).emit('notYourTurn');
                io.to(idArr[roomID].roomId).emit('userDied', idArr[roomID].meyerLives[i][0], screenName);
                io.to(idArr[roomID].roomId).emit('updateGameLog', `${screenName} is dead`);
                delete idArr[roomID].meyerLives[i];
                pushArray(idArr[roomID].meyerLives, i);
                idArr[roomID].meyerLives.pop();
                if(idArr[roomID].meyerLives.length == 1) {
                    io.to(idArr[roomID].roomId).emit('gameOver');
                }
            }
        }
    }
}

function checkDrink(diceArr) {
    if (diceArr[0] == 3 && diceArr[1] == 2) {
        return true;
    } else {
        return false;
    }
};

function findScreenName(roomID, playerID){
    for(let i = 0; i < idArr[roomID].meyerLives.length; i++){
        if(playerID == idArr[roomID].meyerLives[i][0]){
            return idArr[roomID].meyerLives[i][2];
        }
    }
}

//------------------------------DICE FUNCTIONS END-------------------------

// Creates a new random room
function randomRoom(socket, id) {
    let room = new idObj(id, 0);

    idArr.push(room);
    socket.join(room.roomId);
    socket.room = room.roomId;

    console.log("User " + socket.userName + " joined room " + id);
}

//Removes "holes" in the array
function pushArray (arr, index) {
    let SENTINAL = true;

    while (SENTINAL) {
        arr[index] = arr[index + 1];
        if (arr[index] == dontTouch) {  
            SENTINAL = false;
        }
        index++;
    }
}

// Starts the server
server.listen(port, hostname, () => console.log('listening on ' + hostname + ':' + port) );

var d = new Date();
console.log(d.toLocaleTimeString() + '  ' + d.toLocaleDateString());