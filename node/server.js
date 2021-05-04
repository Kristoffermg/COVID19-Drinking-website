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
    if(err) console.log(err);
    else console.log("Connected to database established");
});

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
                    htmlPath = '/PublicResources/htmlLocal/createlobby.html';  //Midlertidig
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
    this.customPrompts = [];
    this.roundtimeValue = 0;
    this.nextPromptCountdown = 0;

    this.neverGame = function NeverObj(neverPrompts) {
        this.useCustomPromptsExclusively = false;
        this.neverHaveIEverPrompts = neverPrompts;
        this.usedPrompts = [];
        this.counter = 0;
        this.voteCount = 0;
        this.votingRight = 0;
        this.answerArr = [];
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
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', socket.id);
        });
    });

    socket.on('answerCall', (callerID) => {
        io.to(callerID).emit('ringring', socket.id);
    });

    //Decides what html page the send to dynamically send to the frontend, based on user input 
    socket.on('startGame', (gameType, roundtime, _useCustomPromptsExclusively) => {
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

                                idArr[id].useCustomPromptsExclusively = _useCustomPromptsExclusively;
                                if(_useCustomPromptsExclusively === false) {
                                    mixCustomAndWrittenPrompts(id);
                                }
                            });
                            console.log("pog");
                        }
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
                    htmlPath = '/PublicResources/htmlLocal/createlobby.html'; //<-- Midlertidig path så ting ikk explodere
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

            //io.to(socket.room).emit('setRoundtime', 3);
            //Reads the relevent html file, and sends it to the frontend
            fs.readFile(__dirname + `${htmlPath}`, 'utf8', function(err, data) {
                if (err) throw err;
                io.to(socket.room).emit('changeHTML', data);
            });
            socket.emit
        }

        console.log("Room " + idArr[id].roomId + " has started a game of the type " + idArr[id].startedGame);

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
        console.log("IDWORKS ->>>>>>>>>>>>" + id);
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
    socket.on('insertProfilePictureQuery', picture => {
        con.query("INSERT INTO ProfilePictures(userID, roomID, pfp) VALUES(?, ?, ?)", [
            socket.id,
            getRoomID(socket),
            picture
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

function mixCustomAndWrittenPrompts(id) {
    for(let i = 0; i < idArr[id].customPrompts.length; i++) {
        idArr[id].neverHaveIEverPrompts.push(idArr[id].customPrompts[i])
    }
    console.log(idArr[id].neverHaveIEverPrompts);
}

function getHighestPromptID() {
    con.query("SELECT * FROM NeverHaveIEverPrompts ORDER BY promptID DESC LIMIT 1", function(err, result) {
        if(result === undefined) return 0;
        return result;
    });
    return 0;
}

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

function countdown(time, socket, id) {
    console.log(`counter for room ${id} is at ` + time);
    if(time > 0) {
        setTimeout(function() { countdown(--time, socket, id) }, 1000);
    } else {    
        console.log(`counter for room ${id} ended`);
        io.to(socket.room).emit("activateNextRoundBtn");
        io.to(socket.room).emit('revealAnswer', idArr[id].answerArr);
        idArr[id].answerArr = [];
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