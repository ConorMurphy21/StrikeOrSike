const {joinRoom, disconnectPlayer, createRoom, getRoomById, getRoomByName} = require('../../models/rooms');

module.exports = (io, socket) => {

    socket.onAny(() => {
        // update activity
        const room = getRoomById(socket.id);
        if(room){
            room.lastActivity = (new Date()).getTime();
        }
    })

    /*** CONNECTION AND ROOM CREATION ***/
    socket.on('createRoom', (name, roomName, lang) => {
        // disconnect for cleanup
        disconnect(socket);
        const result = createRoom(socket.id, name, roomName, lang);
        // store name in session variable
        if (result.error) {
            socket.emit('joinRoom', {error: result.error});
        } else {
            const room = result.room;
            socket.join(room.name);
            socket.emit('joinRoom', {success: true, roomName: room.name});
            socket.emit('updatePlayers', {modifies: room.players, deletes: []});
        }
    });

    socket.on('joinRoom', (name, roomName) => {
        // disconnect for cleanup
        disconnect(socket);
        const result = joinRoom(socket.id, name, roomName);
        if (result.error) {
            socket.emit('joinRoom', {error: result.error});
        } else {
            const room = result.room;
            socket.join(room.name);
            socket.emit('joinRoom', {success: true, roomName: room.name});
            socket.emit('updatePlayers', {modifies: room.players, deletes: []});
            socket.to(room.name).emit('updatePlayers', {
                modifies: [room.players.find(p => p.name === name)],
                deletes: []
            });
        }
    });


    socket.on('disconnect', () => {
        disconnect(socket);
    });
};

function disconnect(socket) {
    let roomName = getRoomById(socket.id)?.name;
    disconnectPlayer(socket.id);
    // remove socket from room
    if(roomName) socket.leave(roomName);

    const room = getRoomByName(roomName);
    if (room) {
        const player = room.players.find(p => p.id === socket.id);
        // could be modified
        const leader = room.players.find(p => p.leader);
        socket.to(room.name).emit('updatePlayers', {modifies: [player, leader], deletes: []});
    }
}

