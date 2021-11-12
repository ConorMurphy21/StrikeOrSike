const {joinRoom, disconnectPlayer, getPlayerById, createRoom, getRoomById} = require("../models/rooms");

var socketcalls = function(io) {
    io.on("connection", (socket) => {

        socket.on("createRoom", (name, roomName) => {
            // disconnect for cleanup
            disconnect(socket);
            const result = createRoom(socket.id, name, roomName);
            // store name in session variable
            if (result.error) {
                socket.emit("joinRoom", result.error);
            } else {
                const room = result.room;
                socket.join(room.name);
                socket.emit("joinRoom", {success: true});
                socket.emit("updatePlayers", {modifies: room.players, deletes: []});
            }
        });

        socket.on("joinRoom", (name, roomName) => {
            // disconnect for cleanup
            disconnect(socket);
            const result = joinRoom(socket.id, name, roomName);
            if (result.error) {
                socket.emit("joinRoom", result.error);
            } else {
                const room = result.room;
                socket.join(room.name);
                socket.emit("joinRoom", {success: true});
                socket.emit("updatePlayers", {modifies: room.players, deletes: []});
                socket.to(room.name).emit("updatePlayers", {
                    modifies: [room.players.find(p => p.name === name)],
                    deletes: []
                });
            }
        });

        socket.on("disconnect", () => {
            disconnect(socket);
        });
    });
}

function disconnect(socket){
    disconnectPlayer(socket.id);
    // remove socket from room
    socket.leaveAll();
    const room = getRoomById(socket.id);
    if(room)
        socket.to(room.name).emit("updatePlayers", {modifies: [getPlayerById(socket.id)], deletes: []});
}

module.exports = socketcalls;