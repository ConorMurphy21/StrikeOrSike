const {joinRoom, disconnectPlayer, getPlayerById, createRoom, getRoomById} = require("../models/rooms");

var socketcalls = function(io) {
    io.on("connection", (socket) => {

        socket.on("createRoom", (name, roomName) => {
            const result = createRoom(socket.id, name, roomName);
            // store name in session variable
            if (result.error) {
                socket.emit("joinRoom", result.error);
            } else {
                socket.emit("joinRoom", {success: true});
                socket.emit("updatePlayers", {modifies: result.room.players, deletes: []});
            }
        });

        socket.on("joinRoom", (name, roomName) => {
            const result = joinRoom(socket.id, name, roomName);
            if (result.error) {
                socket.emit("joinRoom", result.error);
            } else {
                const room = result.room;
                socket.emit("joinRoom", {success: true});
                socket.emit("updatePlayers", {modifies: room.players, deletes: []});
                socket.to(room.name).emit("updatePlayers", {modifies: [getPlayerById(socket.id)], deletes: []});
            }
        });

        socket.on("disconnect", () => {
            disconnectPlayer(socket.id);
            const room = getRoomById(socket.id);
            if(room)
                io.to(room.name).emit("updatePlayers", {modifies: [getPlayerById(socket.id)], deletes: []});

        });
    });
}

module.exports = socketcalls;