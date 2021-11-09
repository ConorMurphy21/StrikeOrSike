const {joinRoom, disconnectPlayer, getPlayer} = require("../models/model");

var socketcalls = function(io) {
    io.on("connection", (socket) => {
        console.log("socket.connecting:");
        console.dir(socket.handshake.query);
        const room = joinRoom(socket.id, socket.handshake.query.name, socket.handshake.query.roomName);

        //todo: better handling for this
        if(!room)
            socket.emit("error", "room does not exist");

        // join the socket room
        socket.join(room.name);
        socket.to(room.name, "player_joined", socket.handshake.query.name);


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