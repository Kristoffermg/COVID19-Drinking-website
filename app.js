
const hostname = '127.0.0.1';
const port = 3100;

//const socket = io.connect('wss://sw2b2-3.p2datsw.cs.aau.dk/node0');

const socket = io({path:'/node0/socket.io', transports: ["polling"]});



socket.on('message', text => {

    const el = document.createElement('li');
    el.innerHTML = text;
    document.querySelector('ul').appendChild(el);

    if(document.querySelectorAll("#list li").length > 9){
	document.getElementById("list").removeChild(document.getElementById("list").childNodes[0]);
    }

});

socket.on('connect_error', (err) => {
    console.log(err);
    console.log('brr');
});

document.getElementById("sendMessage").onclick = () => {
    const text = document.getElementById("messageInput").value;
    const id = document.getElementById("sendRoomInput").value;
    socket.emit('newMessage', {msg: text, id: id});
    document.getElementById("messageInput").value = '';
}

document.getElementById("changeNameButton").onclick = () => {
    const name = document.getElementById("clientName").value;
    socket.emit('changeName', name);
    console.log("Requested to change name to " + name);
}

document.getElementById("roomButton").onclick = () => {
    const roomId = document.getElementById("roomInput").value;
    socket.emit('joinRoom', roomId);
    console.log("Requested to join roomId " + roomId);
}

document.getElementById("disRoomButton").onclick = () => {
    const roomId = document.getElementById("roomInput").value;
    socket.emit('disconnectRoom', roomId);
    console.log("Requested to disconnect from roomId " + roomId);
}

document.getElementById("randomRoom").onclick = () => {
    socket.emit('randomRoom');
    console.log("Requested to join room with base64 ID");
}

document.getElementById("disconnect").onclick = () => {
    socket.disconnect();
    console.log("disconnected");
}


document.getElementById("checkRooms").onclick = () => {
    socket.emit('checkRooms');
}