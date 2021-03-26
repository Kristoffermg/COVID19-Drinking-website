
const socket = io('ws://localhost:3000');

socket.on('message', text => {

    const el = document.createElement('li');
    el.innerHTML = text;
    document.querySelector('ul').appendChild(el)

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

document.getElementById("checkRooms").onclick = () => {
    socket.emit('checkRooms');
}