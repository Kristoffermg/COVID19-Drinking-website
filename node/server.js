//UwUbuntu

const { DH_UNABLE_TO_CHECK_GENERATOR } = require('constants');

//Server setup
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const pathApi = require('path');
const fs = require('fs');
const { debug } = require('console');
const { CLOSING } = require('ws');

const io = require('socket.io')(server, {
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
    res.sendFile(pathApi.join(__dirname + '/PublicResources/html/index.html'));
});

app.get('/Lobby', function(req, res) {
    fs.readFile(__dirname + '/PublicResources/html/createlobby.html', 'utf8', function(err, data) {
        if (err) throw err;
        //console.log(data);
        res.send(data);
    });
});

app.get('/Lobby/:lobbyId', function(req, res) {
    let lobbyId = req.params.lobbyId;
    console.log(lobbyId);
    if (idArr.length <= 0) {
        res.redirect('/node0/');
    }

    for (let i = 0; i < idArr.length; i++) {
        if (idArr[i].roomId == lobbyId) {
            fs.readFile(__dirname + '/PublicResources/html/createlobby.html', 'utf8', function(err, data) {
                if (err) throw err;
                //console.log(data);
                res.send(data);
            });
        } else {
            res.redirect('/node0/');
        }
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

    this.neverGame = function NeverObj(neverPrompts) {
        this.neverHaveIEverPrompts = neverPrompts;
        this.usedPrompts = [];
        this.counter = 0;
    }
}

//Don't Touch :)
let dontTouch;
let dontTouchTwo;

let idBase;

let idArr = [];

const nextPromptCountdown = 10;

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

    //Changes the username of the user who requested it
    socket.on('changeName', (name, userId) => {
        console.log("name: " + name + " id: " + userId);
        let oldName = socket.userName;
        socket.userName = name;
        
        io.to(socket.room).emit('changeName', socket.userName, userId);
        
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
    socket.on('joinRoom', (roomId, userId, idFlag) => {
        var d2 = new Date();
        console.log("");
        console.log(d2.toLocaleTimeString() + '  ' + d2.toLocaleDateString());
        socket.admin = false;
        if (idFlag) {
            randomRoom(socket, roomId);
        } else {
            socket.join(roomId);
            socket.room = roomId;
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
                }
            }
        }

        socket.to(roomId).broadcast.emit("user-connected", userId);
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId);
        });
    });

    //Decides what html page the send to dynamically send to the frontend, based on user input 
    socket.on('startGame', gameType => {
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
                            fs.readFile(__dirname + "/MiscFiles/NeverPrompts.txt", "utf8", function(err, data) {
                                if (err) throw err;
                                //https://stackoverflow.com/questions/8125709/javascript-how-to-split-newline/8125757 <-- Stjal regex expression herfra
                                let neverHaveIEverPrompts = data.split(/\r?\n/);
                                idArr[i].neverGame(neverHaveIEverPrompts);
                            });
                            console.log("pog");                     
                        }
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
                    htmlPath = '/PublicResources/html/createlobby.html'; //<-- Midlertidig path så ting ikk explodere
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
    
            //Reads the relevent html file, and sends it to the frontend
            fs.readFile(__dirname + `${htmlPath}`, 'utf8', function(err, data) {
                if (err) throw err;
                io.to(socket.room).emit('changeHTML', data);
            });
        }

    });

    //Handles 'Never have I ever' logic
    socket.on('neverLogic', () => {
        let id;
        for(let i = 0; i < idArr.length; i++) {
            if(idArr[i].roomId === socket.room) {
                id = i;
            }
        }
        if(unusedPromptsLeft(id)) {
            let randomPromptIndex = randomPrompt(id);
            idArr[id].usedPrompts[idArr[id].counter] = randomPromptIndex;
            idArr[id].counter++;
            console.log("Prompt to send: '" + idArr[id].neverHaveIEverPrompts[randomPromptIndex] + "'");
            io.to(socket.room).emit("nextPrompt", idArr[id].neverHaveIEverPrompts[randomPromptIndex]);
            io.to(socket.room).emit("countdownTick");
            countdown(nextPromptCountdown, socket, id);
        } else {
            io.to(socket.room).emit("gameOver"); 
        }
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
                    }
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

function currentRoomId(socket) {
    let id;
    for(let i = 0; i < idArr.length; i++) {
        if(idArr[i].roomId === socket.room) {
            id = i;
        }
    }
    return id;
}

function countdown(time, socket, id) {
    console.log(`counter for room ${id} is at ` + time);
    if(time > 0) {
        setTimeout(function() { countdown(--time, socket, id) }, 1000);
    } else {    
        console.log(`counter for room ${id} ended`);
        io.to(socket.room).emit("activateNextRoundBtn");
    }
}

function unusedPromptsLeft(id) {
    if(idArr[id].usedPrompts.length !== idArr[id].neverHaveIEverPrompts.length) {
        return true;
    }
    return false;
}

function randomPrompt(id) {
    let randomPromptIndex;
    do {
        randomPromptIndex = Math.floor(Math.random() * idArr[id].neverHaveIEverPrompts.length);
    } while(promptHasBeenUsed(randomPromptIndex, id));
    idArr[id].usedPrompts[idArr[id].counter] = randomPromptIndex;
    idArr[id].counter++;
    return randomPromptIndex;
}

function promptHasBeenUsed(randomPromptIndex, id) {
    if(idArr[id].usedPrompts.includes(randomPromptIndex)) {
      return true;
    }
    return false;
}

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