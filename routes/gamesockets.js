const {joinRoom, disconnectPlayer, getPlayer} = require("../models/model");

var socketcalls = function(io) {
    io.on("connection", (socket) => {
        const room = joinRoom(socket.id, socket.handshake.query.name, socket.handshake.query.roomName);

        socket.on("disconnect", () => {
            const player = getPlayer(socket.id);
            if(player)
                console.log(player.name + " disconnected.");
            disconnectPlayer(socket.id);
        });
    });
}

module.exports = socketcalls;