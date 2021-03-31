//UwUbuntu

const { DH_UNABLE_TO_CHECK_GENERATOR } = require('constants');

const cors = require('cors');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);

const io = require('socket.io')(server, {
    cors: {
        origin: "*"
    }
});

app.use(cors());
app.options('*', cors());

const hostname = '127.0.0.1';
const port = 3100;

const path = `${__dirname}`;
console.log(path);

app.use(express.static(path));

    io.on("ping", () => {
        console.log('ping');
    });


io.on('connect_error', (err) => {
    console.log(err);
    console.log('brr');
});

function idObj(roomId, amountConnected, userIdArr) {
    this.roomId = roomId;
    this.amountConnected = amountConnected;
    this.userIdArr = [];
    this.userIdArr.push(userIdArr);
}

let dontTouch;
let dontTouchTwo;

let idArr = [];

io.on('connection', (socket) => {


    console.log(socket.userName + " has connected.");
    io.emit('message', `${socket.userName} has connected`);

    socket.leave(socket.id);

    console.log(socket.rooms);
    if(dontTouchTwo == dontTouch){
        dontTouchTwo = socket.rooms;
    }

    socket.on('message', (message) =>     {
        console.log(message);
        io.emit('message', `${socket.userName} said: ${message}` );   
    });

    socket.on('changeName', name => {
        let oldName = socket.userName;
        socket.userName = name;
        io.emit('message', `'${oldName}' has changed name to '${socket.userName}'`);
        console.log("succesfully changed to the name " + socket.userName);
    });

    socket.on('newMessage', ({msg, id}) => {
        console.log("message: " + msg);
        console.log("room id: " + id);

        io.to(id).emit('message', `${socket.userName} said: ${msg}` );
    });

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log("User joined room " + roomId);
    });

    socket.on('randomRoom', () => {
	let id;

	do {
	    let i = Math.random();
	    id = Buffer.from(`${i}`).toString('base64');
	} while (idArr.includes(id));
	
	let room = new idObj(id, 0, socket.id);
	//room.roomId = id;
	room.amountConnected++;

        idArr.push(room);
	socket.join(room.roomId);
	
	/*let clients_in_the_room = io.sockets.adapter.rooms[id];
	console.log(clients_in_the_room); 
	for (let clientId in clients_in_the_room ) {
  	    console.log('client: %s', clientId); //Seeing is believing 
  	    let client_socket = io.sockets.connected[clientId]; //Do whatever you want with this
	}*/

	console.log("roomId: " + room.roomId);
	console.log("Amount of users in room: " + room.amountConnected);
	console.log("Connected users: " + room.userIdArr);

        console.log("User " + socket.userName + " joined room " + id);
    });

    socket.on('checkRooms', () => {
        console.log(idArr);
    });

    socket.on('disconnectRoom', (roomId) => {
        socket.leave(roomId);
        console.log("User left room " + roomId);
    });

    socket.on('disconnect', () => {
        console.log(socket.userName + " has disconnected.");
        io.emit('message', `${socket.userName} has disconnected`);

	
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
		    break;
	        }
	    }
	}
    });
});

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