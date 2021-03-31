const express = require('express');
const app = express();
const http = require('http');
const { v4: uuidV4 } = require('uuid');
const cors = require('cors');
const server = http.createServer(app);
 
const hostname = '127.0.0.1';
const port = 3101;

app.set('view engine', 'ejs')
app.use(express.static('public'));

const io = require('socket.io')(server, {
    cors: {
        origin: "*"
    }
});

app.use(cors());
app.options('*', cors());

const path = `${__dirname}`;
app.use(express.static(path));

app.get('/', (req, res) => {
    res.redirect(`/node1/${uuidV4()}`);
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', userId)
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})

server.listen(port, hostname, () => console.log('listening on ' + hostname + ':' + port) );
//server.listen(3101);