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
    fs.readFile(__dirname + '/PublicResources/html/createlobby.html', 'utf8', function(err, data) {
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
function idObj(roomId, amountConnected, userIdArr) {
    this.roomId = roomId;
    this.amountConnected = amountConnected;
    this.userIdArr = [];
    this.userIdArr.push(userIdArr);
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
    socket.leave(socket.id);
    console.log(socket.rooms);

    //Jeg ander ikk hvad der sker her, men det er nok vigtigt
    if(dontTouchTwo == dontTouch){
        dontTouchTwo = socket.rooms;
    }

    //Generates a random base64 string, which is used as the room id
    do {
        let i = Math.random();
        idBase = Buffer.from(`${i}`).toString('base64');
    } while (idArr.includes(idBase));
    socket.emit('roomId', idBase);

    //Changes the username of the user who requested it
    socket.on('changeName', name => {
        let oldName = socket.userName;
        socket.userName = name;
        
        io.to(socket.room).emit('changeName', socket.userName);
        
        io.emit('message', `'${oldName}' has changed name to '${socket.userName}'`);
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
        if (idFlag) {
            randomRoom(socket, roomId);
        } else {
            socket.join(roomId);
            socket.room = roomId;
            console.log("User joined room " + socket.room);
        }

        socket.to(roomId).broadcast.emit("user-connected", userId);
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId);
        });
    });

    //Decides what html page the send to dynamically send to the frontend, based on user input 
    socket.on('startGame', gameType => {
        let htmlPath;

        console.log("type: " + gameType);
        
        switch (gameType) {
            case 'prompt':
                //Throw prompt html
                break;
            
            case 'card':
                //Throw card html
                break;

            case 'dice':
                //Throw dice html
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
    });

    //Actually does nothing, but i am too scared to deletus this fetus
    socket.on('randomRoom', () => {

    });

    //Hihi debug go brr
    socket.on('debug', () => {
        console.log(socket.rooms);
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
                    idArr[i].userIdArr[j] = "";
                    console.log("Fetus has been deletus");
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

//Creates a new random room
function randomRoom(socket, id) {
    //let id;
    /*
    do {
        let i = Math.random();
        id = Buffer.from(`${i}`).toString('base64');
    } while (idArr.includes(id));
    */
    let room = new idObj(id, 0, socket.id);
    room.amountConnected++;

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