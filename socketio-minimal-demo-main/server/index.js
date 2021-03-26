const { DH_UNABLE_TO_CHECK_GENERATOR } = require('constants');

const http = require('http').createServer();

const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

io.on('connection', (socket) => {
    
    console.log(socket.userName + " has connected.");
    io.emit('message', `${socket.userName} has connected`);

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

    socket.on('checkRooms', () => {
        console.log(socket.rooms);
    });

    socket.on('disconnectRoom', (roomId) => {
        socket.leave(roomId);
        console.log("User left room " + roomId);
    });

    socket.on('disconnect', () => {
        console.log(socket.userName + " has disconnected.");
        io.emit('message', `${socket.userName} has disconnected`);
    });
});

http.listen(3000, () => console.log('listening on http://localhost:3000') );