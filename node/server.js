//UwUbuntu

//Server setup
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

//Handling of HTML files
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
    if(err) console.log("Error connecting to database: Either the database is down or it's hosted on localhost.");
    else console.log("Connected to database established.");
});

app.get('/', function(req, res) {
    res.sendFile(pathApi.join(__dirname + '/PublicResources/html/index.html'));
});

app.get('/Lobby', function(req, res) {
    // fs.readFile(__dirname + '/PublicResources/html/createlobby.html', 'utf8', function(err, data) {
    //     if (err) throw err;
    //     //console.log(data);
    //     res.send(data);
    // });
    res.sendFile(__dirname + '/PublicResources/html/createlobby.html');
});

app.get('/Lobby/:lobbyId', function(req, res) {
    let lobbyId = req.params.lobbyId;
    let fileSent = false;
    console.log(lobbyId);
    if (idArr.length <= 0) {
        // res.redirect('/');      //Changed from /node0/
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

                case 'card':
                    htmlPath = '/PublicResources/html/createlobby.html';  //Midlertidig          
                    break;

                case 'dice':
                    htmlPath = '/PublicResources/html/dummyMejer.html';  //Midlertidig
                    break;

                default:
                    htmlPath = '/PublicResources/html/createlobby.html';
                    break;
            }

            // fs.readFile(__dirname + htmlPath, 'utf8', function(err, data) {
            //     if (err) throw err;
            //     //console.log(data);
            //     res.send(data);
            // });
            res.sendFile(__dirname + htmlPath);
            fileSent = true;

        } else {
            // res.redirect('/');  //Changed from /node0/
        }
    }

    if (!fileSent) {
        console.log("Else in switch");
        res.sendFile(pathApi.join(__dirname + '/PublicResources/html/error.html'));
    }
});

app.get('/GamesAndRules', function(req, res) {
    fs.readFile(__dirname + '/PublicResources/html/gamesAndRules.html', 'utf8', function(err, data) {
        if (err) throw err;
        //console.log(data);
        res.send(data);
    });
});
    
io.on('connect_error', (err) => {
    console.log(err);
    console.log('brr');
});

//Constructer function for room objects
function idObj(roomId, amountConnected) {
    this.roomId = roomId;
    this.amountConnected = amountConnected;
    this.userIdArr = [];
    this.customProfilePictureSet = [];
    this.startedGame = 'none';
    this.customPrompts = [];
    this.roundtimeValue = 0;
    this.nextPromptCountdown = 0;

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

    this.mejer = function MejerObj(ranks) {
        this.lastRoll = [0,0];
        this.rollToBeat = [0,0];
        this.lieRoll = [0,0];
        this.wasLastLie = false;
        this.mejerRanks = ranks;
        this.currTurn = 0;
        this.mejerLives = [];
    }
    
}

//Don't Touch :)
let dontTouch;
let dontTouchTwo;

let idBase;

let idArr = [];

//All the socket functions
io.on('connection', (socket) => {
    console.log(socket.userName + " has connected.");
    //idArr[i].neverGame(neverHaveIEverPrompts);

    //Leaves own id-room
    console.log(socket.rooms);

    //Jeg ander ikk hvad der sker her, men det er nok vigtigt
    if(dontTouchTwo == dontTouch){
        dontTouchTwo = socket.rooms;
    }

    //Generates a random base64 string, which is used as the room id
    do {
        let i = Math.random();
        idBase = "roomId-" + Buffer.from(`${i}`).toString('base64');
    } while (idArr.includes(idBase));
    socket.emit('roomId', idBase);

    //Gives the id of the socket to the client
    socket.on('getId', () => {
        socket.emit('getId', socket.id);
    });

    socket.on('DUMMYchangeName', (name, userId) => {
        // console.log("name: " + name + " id: " + userId);
        // let oldName = socket.userName;
        // socket.userName = name;
        
        io.to(socket.room).emit('changeName', socket.userName, userId, "This is a dummy string");
        
        //io.emit('message', `'${oldName}' has changed name to '${socket.userName}'`);
        // console.log("succesfully changed to the name " + socket.userName);
    });

    //Changes the username of the user who requested it
    socket.on('changeName', (name) => {
        console.log("-------------------> name: " + name + " id: " + socket.id);
        let oldName = socket.userName;
        socket.userName = name;
        
        io.to(socket.room).emit('changeName', socket.userName, socket.id);
        
        //io.emit('message', `'${oldName}' has changed name to '${socket.userName}'`);
        console.log("succesfully changed to the name " + socket.userName);
    });

    //haha debug go brr
    socket.on('debugMeme', () => {
        fs.readFile(__dirname + '/PublicResources/html/createlobbyMeme.html', 'utf8', function(err, data) {
            if (err) throw err;
            io.to(socket.room).emit('debugMeme', data);
        });
    });

    //Chat function
    socket.on('newMessage', ({msg, id}) => {
        console.log("message: " + msg);
        console.log("room id: " + id);

        io.to(id).emit('message', `${socket.userName} said: ${msg}` );
    });

    //Joins an existing room based on the url, or creates one if nessesary
    socket.on('joinRoom', (roomId, idFlag) => {
        var d2 = new Date();
        console.log("");
        console.log(d2.toLocaleTimeString() + '  ' + d2.toLocaleDateString());
        socket.admin = false;
        if (idFlag) {
            randomRoom(socket, roomId);
        } else {
            socket.join(roomId);
            socket.room = roomId;
            socket.emit('yeetAdminStuff');
            console.log("User joined room " + socket.room);
        }


        let Id = 0;
        for (let i = 0; i < idArr.length; i++) {
            if (idArr[i].roomId == socket.room) {
                Id = i;
                idArr[i].amountConnected++;
                idArr[i].userIdArr.push(socket.id);
                console.log("room: " + idArr[i].roomId);
                console.log("amount: " + idArr[i].amountConnected);
                if (idArr[i].amountConnected == 1) {
                    socket.admin = true;
                    socket.emit('makeAdmin');
                }
            }
        }

        socket.to(roomId).broadcast.emit("user-connected", socket.id);

        for(let j = 0; j < idArr[Id].userIdArr.length - 1; j++) {
            if(idArr[Id].customProfilePictureSet[j]) { // other user has set their profile picture
                getUsersProfilePicture(socket, idArr[Id].userIdArr[j]);
            }
        }
        // if(idArr[Id].amountConnected > 1) { // if theres other users in the room then it should retrieve the other users profile pictures
        //     for(let j = 0; j < idArr[Id].userIdArr.length - 1; j++) {
        //         getUsersProfilePicture(socket, idArr[Id].userIdArr[j]);
        //     }
        // }
        socket.on('disconnect', () => {
            deleteUsersProfilePicture(socket.id);
            socket.to(roomId).broadcast.emit('user-disconnected', socket.id);
        });
    });

    socket.on('answerCall', (callerID) => {
        let roomId = getRoomID(socket), userId = getUserID(socket);
        io.to(callerID).emit('ringring', socket.id, idArr[roomId].customProfilePictureSet[userId]);
    });

    //Decides what html page the send to dynamically send to the frontend, based on user input 
    socket.on('startGame', (gameType, amountOfSips, roundtime, _useCustomPromptsExclusively) => {
        let id;
        if (!socket.admin) {
            socket.emit('noAdminPerm');
        } else {
            let htmlPath;
            console.log(gameType);
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
                                //https://stackoverflow.com/questions/8125709/javascript-how-to-split-newline/8125757 <-- Stjal regex expression herfra

                                let neverHaveIEverPrompts = data.split(/\r?\n/);
                                idArr[i].neverGame(neverHaveIEverPrompts);

                                idArr[i].amountOfSipsRule = amountOfSips;

                                idArr[id].useCustomPromptsExclusively = _useCustomPromptsExclusively;
                                if(_useCustomPromptsExclusively === false) {
                                    mixCustomAndWrittenPrompts(id);
                                }
                            });
                            console.log("pog");
                        }
                    }

                    switch(roundtime) {
                        case '1s':
                            idArr[id].roundtimeValue = 1;
                            idArr[id].nextPromptCountdown = 1;
                            break;
                        case '10s':
                            idArr[id].roundtimeValue = 10;
                            idArr[id].nextPromptCountdown = 10;
                            break;
                        case '15s':
                            idArr[id].roundtimeValue = 15;
                            idArr[id].nextPromptCountdown = 15;
                            break;
                        case '30s':
                            idArr[id].roundtimeValue = 30;
                            idArr[id].nextPromptCountdown = 30;
                            break;
                    }
                    break;
                
                case 'card':
                    console.log("Card game chosen");
                    //Throw card html
                    htmlPath = '/PublicResources/html/createlobby.html'; //<-- Midlertidig path så ting ikk explodere
                    break;
    
                case 'dice':
                    console.log("Dice game chosen");
                    //Throw dice html
                    htmlPath = '/PublicResources/html/dummyMejer.html'; //<-- Midlertidig path så ting ikk explodere
                    
                    for (let i = 0; i < idArr.length; i++) {
                        if (idArr[i].roomId == socket.room) {
                            idArr[i].startedGame = gameType;
                            fs.readFile(__dirname + "/MiscFiles/MejerRanks.txt", "utf8", function(err, data) {
                                if (err) throw err;
                                //https://stackoverflow.com/questions/8125709/javascript-how-to-split-newline/8125757 <-- Stjal regex expression herfra
                                let mejerRanks = data.split(/\r?\n/);
                                for (let i = 0; i < mejerRanks.length; i++) {
                                    mejerRanks[i] = mejerRanks[i].split(',');
                                }
                                idArr[i].mejer(mejerRanks);
                                console.log("RANKS!!!!!!!!!!!");
                                console.log(idArr[i].mejerRanks);
                                mejerLivesSetup(i);
                                //console.log(idArr[i]);
                            });
                            console.log("pog");
                        }
                    }
                    break;
                
                case 'test1':
                    htmlPath = '/PublicResources/html/createlobbyMeme.html';
                    break;
                
                case 'test2':
                    htmlPath = '/PublicResources/html/createlobby.html';
                    break;
    
                default:
                    console.log("shit broke");
                    break;
            }


            //io.to(socket.room).emit('setRoundtime', 3);
            //Reads the relevent html file, and sends it to the frontend
            fs.readFile(__dirname + `${htmlPath}`, 'utf8', function(err, data) {
                io.to(socket.room).emit('changeHTML', data);
            });
        }

        //console.log("Room " + idArr[id].roomId + " has started a game of the type " + idArr[id].startedGame);

    });

    socket.on('quitToLobby', () => {
        fs.readFile(__dirname + `/PublicResources/html/createlobby.html`, 'utf8', function(err, data) {
            if (err) throw err;
            io.to(socket.room).emit('changeHTML', data);
        });
    });

    socket.on('userChangedProfilePicture', (userId, profilePicture) => {
        //io.to(socket.room).emit('saveProfilePictureInLocalStorageAsBase64', userId, profilePicture);
        insertProfilePictureIntoDatabase(socket, profilePicture);
        io.to(socket.room).emit('changeUsersProfilePicture', userId, profilePicture)

        let userArrId = getUserID(socket),
            roomId = getRoomID(socket);

        idArr[roomId].customProfilePictureSet[userArrId] = true;
        //console.log(profilePicture)
        console.log(userId);
        //getData(socket, userId); FOR WHEN USER JOINS
        // let result = getOtherUsersProfilePictureFromDatabase(socket);
        // console.log(result);
        // io.to(socket.room).emit('changeUsersProfilePicture', (socket.id, result));
    });

    socket.on('receiveUsersProfilePicture', userId => {
        getUsersProfilePicture(socket, userId);
    });

    //Handles 'Never have I ever' logic
    socket.on('neverLogic', firstTurn => {
        let id, prompt;
        for(let i = 0; i < idArr.length; i++) {
            if(idArr[i].roomId === socket.room) {
                id = i;
            }
        }
        io.to(socket.room).emit("setRoundtime", idArr[id].roundtimeValue);
        console.log("SIPS ->>>>>>>>>>>>>>>>>>>>" + idArr[id].amountOfSipsRule)
        io.to(socket.room).emit('setSipText', idArr[id].amountOfSipsRule);
        idArr[id].voteCount++;
        console.log("votes: " + idArr[id].voteCount);
        idArr[id].votingRight = idArr[id].amountConnected;
        console.log("People with voting right: " + idArr[id].votingRight);
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
                console.log("Prompt to send: '" + prompt + "'");
                io.to(socket.room).emit("nextPrompt", prompt);
                countdown(idArr[id].nextPromptCountdown, socket, id);
                idArr[id].voteCount = 0;
                console.log("votes reset to: " + idArr[id].voteCount);
            } else {
                io.to(socket.room).emit("gameOver"); 
            }
        }
        
    });

    socket.on('neverAnswer', (answer) => {
        let tempArray = [];
        console.log('neverAnswer: ' + answer);

        tempArray[0] = socket.id;
        tempArray[1] = answer;

        for(i = 0; i < idArr.length; i++){
            if(idArr[i].roomId == socket.room){
                idArr[i].answerArr.push(tempArray);
                console.log('-------------------------------------')
                console.log(idArr[i].answerArr);
            }
        }
    });

    //---------------------------DICE SHIT----------------------------
    socket.on('mejerFirstTurn', () => {
        let id = findID(socket.room);
        io.to(idArr[id].mejerLives[0][0]).emit('firstTurn');

        console.log("MEJER FIRST TURN SMILE!!!!!!!!!!!");
        io.to(idArr[id].roomId).emit("debugGoBrrrr");

        io.to(idArr[id].roomId).emit('getUserName');
        io.to(idArr[id].roomId).emit('setTurnOrder', idArr[id].mejerLives);
        //socket.emit('smile');
    });

    socket.on('dontMindMe', () => {
        console.log("DONT MIND ME !!!!!!!");
        let id = findID(socket.room);

        io.to(idArr[id].roomId).emit('getUserName');
    });

    socket.on('turnIndicator',(turnStart) => {
        let id = findID(socket.room);
        console.log(socket.id);
        console.log(turnStart);
        console.log("-------");
        if (turnStart) {
            io.to(idArr[id].roomId).emit('turnIndicator', idArr[id].mejerLives[idArr[id].currTurn][0], idArr[id].mejerLives, turnStart);
        } else {
            io.to(idArr[id].roomId).emit('turnIndicator', socket.id, idArr[id].mejerLives, turnStart);
        }

    });

    socket.on('mejerRoll', () => {
        let dice1 = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
        let dice2 = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
        let id = findID(socket.room);

        console.log(idArr[id]);

        if(idArr[id].wasLastLie){
            idArr[id].rollToBeat = idArr[id].lieRoll;
        }else{
            idArr[id].rollToBeat = idArr[id].lastRoll;
        }

        idArr[id].lastRoll = diceSort(dice1, dice2);
        console.log(idArr[id].lastRoll);
        if(checkDrink(idArr[id].lastRoll)){
            io.to(socket.room).emit('everyoneDrink');
            idArr[id].rollToBeat = [0,0];
            idArr[id].lastRoll = [0,0];
            idArr[id].lieRoll = [0,0];
            idArr[id].wasLastLie = false;
        
            if(idArr[id].currTurn == 0){
                idArr[id].currTurn = idArr[id].mejerLives.length-1;
            }else{
                idArr[id].currTurn--;
            }

            nextTurn(id);
            
        } else {
            socket.emit("mejerRoll", idArr[id].lastRoll);
        }
    });

    socket.on('mejerTrue', () => {
        let id = findID(socket.room);
        let screenName;

        for (let i = 0; i < idArr[id].mejerLives.length; i++) {
            if (idArr[id].mejerLives[i][0] == socket.id) {
                screenName = idArr[id].mejerLives[i][2];
            }
        }


        if(!cmpRoll(idArr[id].lastRoll, idArr[id].rollToBeat, id)){
            socket.emit('trueError');
        }else{
            nextTurn(id);
            console.log("_-----------------------------------------------");
            console.log('SocketID: ' + socket.id);
            socket.emit('notTurn');

            let result = (String(idArr[id].lastRoll[0]) + String(idArr[id].lastRoll[1]));

            //socket.emit('incomingRoll', (result));
            io.to(socket.room).emit('incomingRoll', (result));

            idArr[id].wasLastLie = false;

            io.to(socket.room).emit('updateGameLog', `${screenName} rolled '${result}'`);
        }

    });

    socket.on('mejerLie', (dice1, dice2) => {
        let id = findID(socket.room);
        let screenName;

        for (let i = 0; i < idArr[id].mejerLives.length; i++) {
            if (idArr[id].mejerLives[i][0] == socket.id) {
                screenName = idArr[id].mejerLives[i][2];
            }
        }
        
        idArr[id].lieRoll = diceSort(dice1, dice2);
        console.log(idArr[id].lieRoll);

        if(!cmpRoll(idArr[id].lieRoll, idArr[id].rollToBeat, id)){
            socket.emit('lieError');
        }else{

            console.log('mejerLie else triggered');
            nextTurn(id);
            socket.emit('notTurn');

            let result = (String(idArr[id].lieRoll[0]) + String(idArr[id].lieRoll[1]));

            io.to(socket.room).emit('incomingRoll', (result));


            idArr[id].wasLastLie = true;

            io.to(socket.room).emit('updateGameLog', `${screenName} rolled '${result}'`);
        }
    });

    socket.on('mejerDerover', () => {
        //cmpRoll([1,1], [5,4], 0);
        let id = findID(socket.room);
        let screenName;

        for (let i = 0; i < idArr[id].mejerLives.length; i++) {
            if (idArr[id].mejerLives[i][0] == socket.id) {
                screenName = idArr[id].mejerLives[i][2];
            }
        }

        let dice1 = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
        let dice2 = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
        
        idArr[id].lastRoll = diceSort(dice1, dice2);
        idArr[id].wasLastLie = false;
        console.log('Det eller derover roll');
        console.log(idArr[id].lastRoll);

        nextTurn(id);
        socket.emit('notTurn');

        io.to(socket.room).emit('incomingRoll', ('Det eller derover'));
        io.to(socket.room).emit('updateGameLog', `${screenName} rolled 'Det eller Derover`);

    });

    socket.on('mejerLift', () => {
        let id = findID(socket.room);

        console.log('mejerLift');

        if(idArr[id].wasLastLie){
            //ham der løftede vandt

            for(let i = 0; i < idArr[id].mejerLives.length; i++){
                if(idArr[id].mejerLives[i][0] == socket.id){

                    if(i == 0){
                        i = idArr[id].mejerLives.length-1;
                    }else{
                        i--;
                    }

                    mejerLivesDecrement(idArr[id].mejerLives[i][0], id);

                    for(let j = 0; j < 2; j++){

                        if(idArr[id].currTurn == 0){
                            idArr[id].currTurn = idArr[id].mejerLives.length-1;
                        }else{
                            idArr[id].currTurn--;
                        }
                    }
                    nextTurn(id);
                    io.to(idArr[id].mejerLives[idArr[id].currTurn][0]).emit('startOfNewRound');
                    socket.emit('notTurn');
                    console.log('-------------');
                    console.log("currTurn");
                    console.log(idArr[id].currTurn);
                    console.log(idArr[id].mejerLives);
                    console.log('-------------');
                    break;
                }
            }
            console.log('mejerLift true');
        }else{
            if (checkDrink(idArr[id].lastRoll)) {
                io.to(socket.room).emit('everyoneDrink');
                idArr[id].rollToBeat = [0,0];
                idArr[id].lastRoll = [0,0];
                idArr[id].lieRoll = [0,0];
                idArr[id].wasLastLie = false;
            
                if(idArr[id].currTurn == 0){
                    idArr[id].currTurn = idArr[id].mejerLives.length-1;
                }else{
                    idArr[id].currTurn--;
                }
    
                nextTurn(id);

            } else {
                mejerLivesDecrement(socket.id, id);
                console.log('mejerLift false');
    
                if(idArr[id].currTurn == 0){
                    idArr[id].currTurn = idArr[id].mejerLives.length-1;
                }else{
                    idArr[id].currTurn--;
                }
    
                nextTurn(id);
                io.to(idArr[id].mejerLives[idArr[id].currTurn][0]).emit('startOfNewRound');
            }
        }


    });
    
    socket.on('updateGameLog', (str) => {
        io.to(socket.room).emit('updateGameLog', str);
    });

    socket.on('getUserName', (userName) => {
        let id = findID(socket.room);
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log('userNames');

        console.log('Socket ID: ');
        console.log(socket.id);
        for(let i = 0; i < idArr[id].mejerLives.length; i++){
            if(socket.id == idArr[id].mejerLives[i][0]){
                idArr[id].mejerLives[i][2] = userName;
                console.log(idArr[id].mejerLives[i][2]);
            }
        }
    });
    
    /*

    fællesskål?

    */


    //-------------------------DICE SHIT END----------------------------
    socket.on('chatMessage', (message, userid) => {
        console.log("User: " + userid + ", send:" + message);
        io.to(socket.room).emit('newMessage', message, userid);
    });

    //Actually does nothing, but i am too scared to deletus this fetus
    socket.on('randomRoom', () => {

    });

    //Hihi debug go brr
    socket.on('debug', () => {
        console.log(socket.rooms);
    });

    socket.on('checkAdminStatus', () => {
        socket.emit('checkAdminStatus', socket.admin);
        //io.to(idArr[0].userIdArr[0]).emit("meme");
    });

    socket.on('makeAdmin', () => {
        socket.admin = true;
        console.log("post make admin true");
    });

    //Runs when socket disconnects from a room
    socket.on('disconnectRoom', (roomId) => {
        socket.leave(roomId);
        console.log("User left room " + roomId);
        disconnectHandler(socket);
    });

    //runs when socket disconnects from server
    socket.on('disconnect', () => {
        console.log(socket.userName + " has disconnected.");
        io.emit('message', `${socket.userName} has disconnected`);
        disconnectHandler(socket);
    });

    socket.on('storeCustomPrompt', prompt => {
        let id = getRoomID(socket);
        // Ternary operator in case the customPrompts array has no values (undefined)
        idArr[id].customPrompts.push(prompt);
        console.log(idArr[id].customPrompts);
    });

    socket.on('deleteCustomPrompt', prompt => {
        let id = getRoomID(socket);
        let index = idArr[id].customPrompts.indexOf(prompt); // If index is -1 then customPrompts doesn't contain the prompt
        if(index > -1) {
            idArr[id].customPrompts.splice(index, 1);
        }
        console.log(idArr[id].customPrompts)

    });

    // remove if we wont upload profile pictures to the database
    socket.on('insertProfilePictureQuery', profilePictureAsBase64 => {
        con.query("INSERT INTO ProfilePictures(userID, roomID, pfp) VALUES(?, ?, ?)", [
            socket.id,
            getRoomID(socket),
            profilePictureAsBase64
        ], function(err, result) {
            console.log(`${socket.id} profile picture inserted in room ${getRoomID(socket)}`);
        });
    });

    socket.on('selectQuery', query => {
        con.query(query, function(err, result, fields) {
            console.log(result);
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
    console.log(idArr[id].neverHaveIEverPrompts);
}

var test = "";

function insertProfilePictureIntoDatabase(socket, profilePictureAsBase64) {
    con.query("INSERT INTO ProfilePictures(userID, roomID, pfp) VALUES(?, ?, ?)", [
        socket.id,
        getRoomID(socket),
        profilePictureAsBase64
    ], function(err, result) {
        console.log(`${socket.id} profile picture inserted in room ${getRoomID(socket)}`);
    });
}

function getOtherUsersProfilePictureFromDatabase(userId) {
    console.log("->>>>>>>>>>>>>>>>>>" + userId);
    return new Promise(function(resolve, reject) {
        con.query('SELECT pfp FROM ProfilePictures WHERE userId = ?', [userId], function(err, result) {
            if(result === undefined) {
                reject(new Error("Error: result is undefined"));
            } else {
                console.log("promise resolved")
                //console.log(result[0].pfp)
                try {
                    let test = result[0].pfp;
                    resolve(test);
                } catch {
                    console.log("Error retrieving profile picture from the database.")
                }

            }
        }); 
    });
}

async function getUsersProfilePicture(socket, userId) {
    const data = await getOtherUsersProfilePictureFromDatabase(userId)
    console.log("current id: " + socket.id + " other ID: " + userId)
    if(data !== undefined) {
        io.to(socket.room).emit('saveUsersProfilePicture', data);
    }
}

function deleteUsersProfilePicture(userId) {
    con.query("DELETE FROM ProfilePictures WHERE userId = ?", [
        userId,
    ], function(err, result) {
        console.log(`${userId} profile picture deleted`);
    });
}

// getOtherUsersProfilePictureFromDatabase(socket) {
//     try { 
//         const result = await getOtherUsersProfilePictureFromDatabase(socket);
//         return result;
//     } catch(e) {
//         console.log(e);
//         return "";
//     }

// }

//Changes the idArr and removes a room object, if it has no user in it
function disconnectHandler (socket) {
    if(socket.rooms !== dontTouchTwo){
	    for(let i = 0; i < idArr.length; i++){
	        for(let j = 0; j < idArr[i].userIdArr.length; j++) {
	            if (idArr[i].userIdArr[j] == socket.id) {
                    idArr[i].amountConnected--;
                    delete idArr[i].userIdArr[j];
                    pushArray(idArr[i].userIdArr, j);
                    idArr[i].userIdArr.pop();
                    console.log("Fetus has been deletus");
                    console.log(idArr[i].userIdArr);
                    console.log("status: " + socket.admin);
                    if (socket.admin) {
                        console.log("UserIdArr:");
                        console.log(idArr[i].userIdArr);
                        let newAdmin = Math.floor(Math.random() * (idArr[0].userIdArr.length));
                        io.to(idArr[i].userIdArr[newAdmin]).emit("makeAdmin");
                        console.log("Print i slutning af if");
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

//finder index på rum i idArr
function findID(roomId){
    for (let i = 0; i < idArr.length; i++) {
        if (idArr[i].roomId == roomId) {
            return i;
        }
    }
}

function countdown(time, socket, id) {
    console.log(`counter for room ${id} is at ` + time);
    if(time > 0) {
        setTimeout(function() { countdown(--time, socket, id) }, 1000);
    } else {    
        console.log(`counter for room ${id} ended`);
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
    console.log(idArr[id].usedPrompts.length + " != " + promptArrLength);
    if(idArr[id].usedPrompts.length !== promptArrLength) {
        return true;
    }
    return false
}

function randomPrompt(id) {
    let randomPromptIndex;
    let promptArrLength = idArr[id].useCustomPromptsExclusively === false ? idArr[id].neverHaveIEverPrompts.length : idArr[id].customPrompts.length;
    console.log("Custom prompts: " + idArr[id].useCustomPromptsExclusively + " length: " + promptArrLength);
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

//---------------------------------DICE SHIT----------------------

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

//returns true if arrNew is a better roll than arrAgainst
function cmpRoll(arrNew, arrAgainst, id) {
    let i;
    let j;

    console.log('enter compare');
    console.log(arrNew);
    console.log(arrAgainst);

    for(i = 0; i < idArr[id].mejerRanks.length; i++){
        if(arrNew[0] == idArr[id].mejerRanks[i][0] && arrNew[1] == idArr[id].mejerRanks[i][1]) {
            console.log("It werk i");
            console.log(i);
            break;
        }
    }

    for(j = 0; j < idArr[id].mejerRanks.length; j++){
        if(arrAgainst[0] == idArr[id].mejerRanks[j][0] && arrAgainst[1] == idArr[id].mejerRanks[j][1]) {
            console.log("It werk j");
            console.log(j);
            break;
        }
    }

    if(i >= j){
        console.log('true');
        return true;
    }else{
        console.log('false');
        return false;
    }

}

function nextTurn(id) {
    console.log('currTurn');
    console.log(idArr[id].currTurn);
    if (idArr[id].currTurn < idArr[id].mejerLives.length - 1) {
        idArr[id].currTurn++;
    } else {
        idArr[id].currTurn = 0;
    }

    io.to(idArr[id].mejerLives[idArr[id].currTurn][0]).emit('clientTurn');
}

function mejerLivesSetup(id){
    let tempArray = [];    

    for(let i = 0; i < idArr[id].userIdArr.length; i++){

        tempArray = [idArr[id].userIdArr[i], 6];

        idArr[id].mejerLives[i] = tempArray;
    }
    console.log('mejerLivesSetup');
    console.log(idArr[id].mejerLives);
}

function mejerLivesDecrement(playerID, roomID){
    let screenName;

    for(let i = 0; i < idArr[roomID].mejerLives.length; i++){
        if(playerID == idArr[roomID].mejerLives[i][0]){
            screenName = idArr[roomID].mejerLives[i][2];
            idArr[roomID].mejerLives[i][1]--;
            io.to(idArr[roomID].roomId).emit('looseLife', idArr[roomID].mejerLives[i][0], screenName);
            io.to(idArr[roomID].roomId).emit('updateGameLog', `${screenName} lost a life, and now has ${idArr[roomID].mejerLives[i][1]} left`);
            if(idArr[roomID].mejerLives[i][1] == 0){
                console.log('he die');
                //here people die
                io.to(playerID).emit('notTurn');
                io.to(idArr[roomID].roomId).emit('ded', idArr[roomID].mejerLives[i][0], screenName);
                io.to(idArr[roomID].roomId).emit('updateGameLog', `${screenName} is dead`);
                delete idArr[roomID].mejerLives[i];
                pushArray(idArr[roomID].mejerLives, i);
                idArr[roomID].mejerLives.pop();
                if(idArr[roomID].mejerLives.length == 1) {
                    console.log("GAME OVER SMILE");
                    io.to(idArr[roomID].roomId).emit('gameOver');
                }
            }
        }
    }
    idArr[roomID].rollToBeat = [0,0];
    idArr[roomID].lastRoll = [0,0];
    idArr[roomID].lieRoll = [0,0];
    idArr[roomID].wasLastLie = false;

    console.log('mejerLivesDecrement');
    console.log(idArr[roomID].mejerLives);

}

function checkDrink(diceArr) {
    if (diceArr[0] == 3 && diceArr[1] == 2) {
        return true;
    } else {
        return false;
    }
};


//------------------------------DICE SHIT END-------------------------

//Creates a new random room
function randomRoom(socket, id) {
    //let id;
    /*
    do {
        let i = Math.random();
        id = Buffer.from(`${i}`).toString('base64');
    } while (idArr.includes(id));
    */

    let room = new idObj(id, 0);

    idArr.push(room);
    socket.join(room.roomId);
    socket.room = room.roomId;
    console.log("Det her burde være roomId: " + socket.room);
    //socket.emit('roomId', room.roomId);

    console.log("roomId: " + room.roomId);
    console.log("Amount of users in room: " + room.amountConnected);
    console.log("Connected users: " + room.userIdArr);

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
    
    console.log("Post push: " + arr);
}

//starts the server
server.listen(port, hostname, () => console.log('listening on ' + hostname + ':' + port) );

var d = new Date();
console.log(d.toLocaleTimeString() + '  ' + d.toLocaleDateString());