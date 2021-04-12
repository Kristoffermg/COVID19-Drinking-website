//UwUbuntu

const { DH_UNABLE_TO_CHECK_GENERATOR } = require('constants');

//server setup
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

//Handling af HTML filer
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
//object til at holde står på rum
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

//Alle socket funktioner
io.on('connection', (socket) => {
    console.log(socket.userName + " has connected.");

    socket.leave(socket.id);

    console.log(socket.rooms);
    if(dontTouchTwo == dontTouch){
        dontTouchTwo = socket.rooms;
    }

    do {
        let i = Math.random();
        idBase = Buffer.from(`${i}`).toString('base64');
    } while (idArr.includes(idBase));
    socket.emit('roomId', idBase);

    socket.on('changeName', name => {
        let oldName = socket.userName;
        socket.userName = name;
        
        io.to(socket.room).emit('changeName', socket.userName);
        
        io.emit('message', `'${oldName}' has changed name to '${socket.userName}'`);
        console.log("succesfully changed to the name " + socket.userName);
    });

    socket.on('debugMeme', () => {
        fs.readFile(__dirname + '/PublicResources/html/createlobby.html', 'utf8', function(err, data) {
            if (err) throw err;
            console.log(data);
            io.to(socket.room).emit('debugMeme', data);
        });
    });

    socket.on('newMessage', ({msg, id}) => {
        console.log("message: " + msg);
        console.log("room id: " + id);

        io.to(id).emit('message', `${socket.userName} said: ${msg}` );
    });

    //joiner et rum eller laver et, alt efter URL
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

    socket.on('startGame', gameType => {
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

            default:
                console.log("shit broke");
                break;
        }
    });

    socket.on('randomRoom', () => {

    });

    socket.on('debug', () => {
        console.log(socket.rooms);
    });

    socket.on('disconnectRoom', (roomId) => {
        socket.leave(roomId);
        console.log("User left room " + roomId);
        disconnectHandler(socket);
    });

    socket.on('disconnect', () => {
        console.log(socket.userName + " has disconnected.");
        io.emit('message', `${socket.userName} has disconnected`);
        disconnectHandler(socket);
    });
});

//Ændre i idArr og fjerne rum hvis nødvendigt
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

//laver nyt rum
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

//fjerner et element i array
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

server.listen(port, hostname, () => console.log('listening on ' + hostname + ':' + port) );

var d = new Date();
console.log(d.toLocaleTimeString() + '  ' + d.toLocaleDateString());