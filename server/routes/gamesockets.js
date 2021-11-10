const {joinRoom, disconnectPlayer, getPlayer, createRoom, isRoomJoinable} = require("../models/model");

var socketcalls = function(io) {
    io.on("connection", (socket) => {


        socket.on("createRoom", (name, roomName) => {
            console.log("here " + name + " " + roomName);
            const room = createRoom(name, roomName.toLowerCase());
            // store name in session variable
            if (room.error) {
                socket.emit("joinRoom", room.error);
            } else {
                socket.emit("joinRoom", {success: true});
            }
        });


        socket.on("joinRoom", (name, roomName) => {
            const room = isRoomJoinable(name, roomName.toLowerCase());
            if (room.error) {
                socket.emit("joinRoom", room.error);
            } else {
                socket.emit("joinRoom", {success: true});
            }
        });

        socket.on("disconnect", () => {
            // unnecessary just logging
            const player = getPlayer(socket.id);
            if(player)
                console.log(player.name + " disconnected.");
            disconnectPlayer(socket.id);
        });
    });
}

module.exports = socketcalls;