const {joinRoom, disconnectPlayer, createRoom, getRoomById, getRoomByName} = require("../models/rooms");

const socketcalls = function (io) {
    io.on("connection", (socket) => {

        socket.on("createRoom", (name, roomName) => {
            // disconnect for cleanup
            disconnect(socket);
            const result = createRoom(socket.id, name, roomName);
            // store name in session variable
            if (result.error) {
                socket.emit("joinRoom", {error: result.error});
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
                socket.emit("joinRoom", {error: result.error});
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
};

function disconnect(socket){
    let room = getRoomById(socket.id);
    const roomName = room ? room.name : '';
    disconnectPlayer(socket.id);
    // remove socket from room
    socket.leave(roomName);
    room = getRoomByName(roomName);
    if(room) {
        const player = room.players.find(p => p.id === socket.id);
        // could be modified
        const leader = room.players.find(p => p.leader);
        socket.to(room.name).emit("updatePlayers", {modifies: [player, leader], deletes: []});
    }
}

module.exports = socketcalls;