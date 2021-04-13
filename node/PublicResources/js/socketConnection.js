const socket = io({path:'/node0/socket.io', transports: ["polling"], autoConnect: false});  
console.log("socket connected" + socket.connected);
if (!socket.connected) {
    console.log("Entered weirdass if statement");
    socket.connect();
}