//UwUbuntu

//Server setup
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const pathApi = require('path');
const fs = require('fs');

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

app.get('/', function(req, res) {
    res.sendFile(pathApi.join(__dirname + '/PublicResources/htmlLocal/index.html'));
});

app.get('/Lobby', function(req, res) {
    // fs.readFile(__dirname + '/PublicResources/htmlLocal/createlobby.html', 'utf8', function(err, data) {
    //     if (err) throw err;
    //     //console.log(data);
    //     res.send(data);
    // });
    res.sendFile(__dirname + '/PublicResources/htmlLocal/createlobby.html');
});

app.get('/Lobby/:lobbyId', function(req, res) {
    let lobbyId = req.params.lobbyId;
    let fileSent = false;
    console.log(lobbyId);
    if (idArr.length <= 0) {
        // res.redirect('/');      //Changed from /node0/
        console.log("No rooms exist");
        res.sendFile(pathApi.join(__dirname + '/PublicResources/htmlLocal/error.html'));
    }

    for (let i = 0; i < idArr.length; i++) {
        if (idArr[i].roomId == lobbyId) {
            let htmlPath;
            switch (idArr[i].startedGame) {
                case 'prompt':
                    htmlPath = '/PublicResources/htmlLocal/never.html';
                    break;

                case 'card':
                    htmlPath = '/PublicResources/htmlLocal/createlobby.html';  //Midlertidig          
                    break;

                case 'dice':
                    htmlPath = '/PublicResources/htmlLocal/dummyMejer.html';  //Midlertidig
                    break;

                default:
                    htmlPath = '/PublicResources/htmlLocal/createlobby.html';
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
        res.sendFile(pathApi.join(__dirname + '/PublicResources/htmlLocal/error.html'));
    }
});

app.get('/GamesAndRules', function(req, res) {
    fs.readFile(__dirname + '/PublicResources/htmlLocal/gamesAndRules.html', 'utf8', function(err, data) {
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
    this.startedGame = 'none';

    this.neverGame = function NeverObj(neverPrompts) {
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
    socket.on('changeName', (name, userId) => {
        console.log("name: " + name + " id: " + userId);
        let oldName = socket.userName;
        socket.userName = name;
        
        io.to(socket.room).emit('changeName', socket.userName, userId, socket.id);
        
        //io.emit('message', `'${oldName}' has changed name to '${socket.userName}'`);
        console.log("succesfully changed to the name " + socket.userName);
    });

    //haha debug go brr
    socket.on('debugMeme', () => {
        fs.readFile(__dirname + '/PublicResources/htmlLocal/createlobbyMeme.html', 'utf8', function(err, data) {
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

        for (let i = 0; i < idArr.length; i++) {
            if (idArr[i].roomId == socket.room) {
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
    });

    socket.on('answerCall', (callerID) => {
        io.to(callerID).emit('ringring', socket.id);
    });

    //Decides what html page the send to dynamically send to the frontend, based on user input 
    socket.on('startGame', (gameType, roundtime) => {
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
                    htmlPath = '/PublicResources/htmlLocal/never.html';
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
                                
                                //console.log(idArr[i]);
                            });
                            console.log("pog");
                        }
                    }

                    switch(roundtime) {
                        case '1s':
                            roundtimeValue = 1;
                            nextPromptCountdown = 1;
                            break;
                        case '10s':
                            roundtimeValue = 10;
                            nextPromptCountdown = 10;
                            break;
                        case '15s':
                            roundtimeValue = 15;
                            nextPromptCountdown = 15;
                            break;
                        case '30s':
                            roundtimeValue = 30;
                            nextPromptCountdown = 30;
                            break;
                    }
                    break;
                
                case 'card':
                    console.log("Card game chosen");
                    //Throw card html
                    htmlPath = '/PublicResources/htmlLocal/createlobby.html'; //<-- Midlertidig path så ting ikk explodere
                    break;
    
                case 'dice':
                    console.log("Dice game chosen");
                    //Throw dice html
                    htmlPath = '/PublicResources/htmlLocal/dummyMejer.html'; //<-- Midlertidig path så ting ikk explodere
                    
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
                    htmlPath = '/PublicResources/htmlLocal/createlobbyMeme.html';
                    break;
                
                case 'test2':
                    htmlPath = '/PublicResources/htmlLocal/createlobby.html';
                    break;
    
                default:
                    console.log("shit broke");
                    break;
            }



            //io.to(socket.room).emit('setRoundtime', 3);
            //Reads the relevent html file, and sends it to the frontend
            fs.readFile(__dirname + `${htmlPath}`, 'utf8', function(err, data) {
                if (err) throw err;
                io.to(socket.room).emit('changeHTML', data);
            });

        }

        //console.log("Room " + idArr[id].roomId + " has started a game of the type " + idArr[id].startedGame);

    });

    //Handles 'Never have I ever' logic
    socket.on('neverLogic', firstTurn => {
        io.to(socket.room).emit("setRoundtime", roundtimeValue);
        let id;
        for(let i = 0; i < idArr.length; i++) {
            if(idArr[i].roomId === socket.room) {
                id = i;
            }
        }

        idArr[id].voteCount++;
        console.log("votes: " + idArr[id].voteCount);
        console.log("People with voting right: " + idArr[id].votingRight);

        if ((idArr[id].voteCount > (idArr[id].votingRight / 2)) || firstTurn) {
            console.log("TRIGGER");
            if(unusedPromptsLeft(id)) {
                let randomPromptIndex = randomPrompt(id);
                idArr[id].usedPrompts[idArr[id].counter] = randomPromptIndex;
                idArr[id].counter++;
                console.log("Prompt to send: '" + idArr[id].neverHaveIEverPrompts[randomPromptIndex] + "'");
                io.to(socket.room).emit("nextPrompt", idArr[id].neverHaveIEverPrompts[randomPromptIndex]);
                countdown(nextPromptCountdown, socket, id);
                idArr[id].voteCount = 0;
                console.log("votes reset to: " + idArr[id].voteCount);
            } else {
                io.to(socket.room).emit("gameOver");
                console.log(idArr[id].usedPrompts);
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

        io.to(idArr[id].roomId).emit('getUserName');
        io.to(idArr[id].roomId).emit('setTurnOrder', idArr[id].mejerLives);
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


        for(let i = 0; i < idArr[id].mejerLives.length; i++){
            if(socket.id == idArr[id].mejerLives[i][0]){
                idArr[id].mejerLives[i][2] = userName;
                console.log('userNames');
                console.log(idArr[id].mejerLives[i][2]);
            }
        }
    });
    
    /*

    fællesskål?

    */


    //-------------------------DICE SHIT END----------------------------

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
        socket.to(socket.room).broadcast.emit('user-disconnected', socket.id);
        disconnectHandler(socket);
    });
});

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
let findID = function(roomId, testObject) {
    if(testObject != dontTouch) {
        idArr = testObject;
        console.log("TEST OBJECT DETECTED!");
        console.log(testObject[0].roomId);
    }

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
        idArr[id].votingRight = idArr[id].amountConnected;
        io.to(socket.room).emit("activateNextRoundBtn");
        io.to(socket.room).emit('revealAnswer', idArr[id].answerArr);
        idArr[id].answerArr = [];
    }
}

let unusedPromptsLeft = function(id, testObject) {
    if (testObject != dontTouch) {
        idArr = testObject;
        console.log("TEST OBJECT DETECTED!");
        console.log(testObject[0].unusedPromptsLeft);
    }

    console.log("never length: " + idArr[id].neverHaveIEverPrompts.length);
    console.log("used length: " + idArr[id].usedPrompts);

    if(idArr[id].usedPrompts.length === undefined) idArr[id].usedPrompts[0] = -1;
    if(idArr[id].usedPrompts.length !== idArr[id].neverHaveIEverPrompts.length) {
        return true;
    }
    return false;
}

let randomPrompt = function(id, testObject) {
    if (testObject != dontTouch) {
        idArr = testObject;
        console.log("TEST OBJECT DETECTED!");
    }

    let randomPromptIndex;
    do {
        randomPromptIndex = Math.floor(Math.random() * idArr[id].neverHaveIEverPrompts.length);
    } while(promptHasBeenUsed(randomPromptIndex, id));
    idArr[id].usedPrompts[idArr[id].counter] = randomPromptIndex;
    //idArr[id].counter++;
    return randomPromptIndex;
}

let promptHasBeenUsed = function(randomPromptIndex, id, testObject) {
    if (testObject != dontTouch) {
        idArr = testObject;
        console.log("TEST OBJECT DETECTED!");
    }

    if(idArr[id].usedPrompts.includes(randomPromptIndex)) {
      return true;
    }
    return false;
}

//---------------------------------DICE SHIT----------------------

let diceSort = function (dice1, dice2) {
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
let cmpRoll = function(arrNew, arrAgainst, id, testObject) {
    let i;
    let j;
    if (testObject != dontTouch) {
        idArr = testObject;
        console.log("TEST OBJECT DETECTED!");
        console.log(testObject[0].mejerLives);
    }

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

let nextTurn = function(id, testObject) {
    if (testObject != dontTouch) {
        idArr = testObject;
        console.log("TEST OBJECT DETECTED!");
    }
    
    console.log('currTurn');
    console.log(idArr[id].currTurn);
    if (idArr[id].currTurn < idArr[id].mejerLives.length - 1) {
        idArr[id].currTurn++;
    } else {
        idArr[id].currTurn = 0;
    }

    if(testObject != dontTouch) return idArr[id].mejerLives[idArr[id].currTurn][0];

    io.to(idArr[id].mejerLives[idArr[id].currTurn][0]).emit('clientTurn');
}

let mejerLivesSetup = function(id, testObject){
    if (testObject != dontTouch) {
        idArr = testObject;
        console.log("TEST OBJECT DETECTED!");
    }
    
    let tempArray = [];    

    for(let i = 0; i < idArr[id].userIdArr.length; i++){

        tempArray = [idArr[id].userIdArr[i], 6];

        idArr[id].mejerLives[i] = tempArray;
    }
    console.log('----------------------mejerLivesSetup--------------------');
    console.log(idArr[id].mejerLives);
    
    if (testObject != dontTouch) return idArr[id].mejerLives;
}

let mejerLivesDecrement = function(playerID, roomID, testObject){
    let screenName;

    if (testObject != dontTouch) {
        idArr = testObject;
        console.log("TEST OBJECT DETECTED!");
    }

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

    if (testObject != dontTouch) return idArr[roomID].mejerLives;
}

let checkDrink = function (diceArr) {
    if (diceArr[0] == 3 && diceArr[1] == 2) {
        return true;
    } else {
        return false;
    }
};


//------------------------------DICE SHIT END-------------------------

//Creates a new random room
let randomRoom = function(socket, id, testObject) {
    if (testObject != dontTouch) {
        idArr = testObject;
        console.log("TEST OBJECT DETECTED!");
    }

    //let id;
    /*
    do {
        let i = Math.random();
        id = Buffer.from(`${i}`).toString('base64');
    } while (idArr.includes(id));
    */
    let room = new idObj(id, 0);

    idArr.push(room);

    //For the purpose of tests
    if (testObject != dontTouch) return room.roomId;

    socket.join(room.roomId);
    socket.room = room.roomId;
    console.log("Det her burde være roomId: " + socket.room);
    //socket.emit('roomId', room.roomId);

    console.log("roomId: " + room.roomId);
    console.log("Amount of users in room: " + room.amountConnected);
    console.log("Connected users: " + room.userIdArr);

    console.log("User " + socket.userName + " joined room " + id);
    console.log(room.roomId);
}

//Removes "holes" in the array
let pushArray = function(arr, index, testBool) {
    let SENTINAL = true;

    while (SENTINAL) {
        arr[index] = arr[index + 1];
        if (arr[index] == dontTouch) {  
            SENTINAL = false;
        }
        index++;
    }
    
    console.log("Post push: " + arr);

    if (testBool) return arr;
}

//starts the server
server.listen(port, hostname, () => console.log('listening on ' + hostname + ':' + port) );

var d = new Date();
console.log(d.toLocaleTimeString() + '  ' + d.toLocaleDateString());

//Test Exports
module.exports.diceSort = diceSort;
module.exports.checkDrink = checkDrink;
module.exports.cmpRoll = cmpRoll;
module.exports.findID = findID;
module.exports.unusedPromptsLeft = unusedPromptsLeft;
module.exports.randomPrompt = randomPrompt;
module.exports.promptHasBeenUsed = promptHasBeenUsed;
module.exports.nextTurn = nextTurn;
module.exports.mejerLivesSetup = mejerLivesSetup;
module.exports.mejerLivesDecrement = mejerLivesDecrement;
module.exports.randomRoom = randomRoom;
module.exports.pushArray = pushArray;