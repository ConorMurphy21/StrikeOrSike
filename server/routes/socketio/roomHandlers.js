const {joinRoom, disconnectPlayer, createRoom, getRoomById, getRoomByName} = require('../../models/rooms');
const Joi = require('joi');
const logger = require('../../logger/logger');

/*** handler validation schemas ***/
const roomSchema = Joi.object({
    name: Joi.string().allow(''),
    roomName: Joi.string().allow(''),
    langs: Joi.array()
        .items(
            Joi.string()
                .min(2)
                .max(5)
        )
})

module.exports = (io, socket) => {

    socket.onAny(() => {
        // update activity
        const room = getRoomById(socket.id);
        if (room) {
            room.lastActivity = (new Date()).getTime();
        }
    })

    /*** CONNECTION AND ROOM CREATION ***/
    socket.on('createRoom', (name, roomName, langs) => {
        // disconnect for cleanup
        disconnect(socket);

        const validateResult = roomSchema.validate({name, roomName, langs});
        if(validateResult.error) return;

        const result = createRoom(socket.id, name, roomName, langs);
        // store name in session variable
        if (result.error) {
            logger.info(`(roomHandler) Room creation failed due to ${result.error}`);
            socket.emit('joinRoom', {error: result.error});
        } else {
            logger.info('(roomHandler) Room created');
            const room = result.room;
            socket.join(room.name);
            socket.emit('joinRoom', {success: true, roomName: room.name});
            socket.emit('updatePlayers', {modifies: room.players, deletes: []});
            socket.emit('setOptions', room.state.getOptions());
        }
    });

    socket.on('joinRoom', (name, roomName) => {
        // disconnect for cleanup
        disconnect(socket);

        const validateResult = roomSchema.validate({name, roomName, langs: []});
        if(validateResult.error) return;

        const result = joinRoom(socket.id, name, roomName);
        if (result.error) {
            logger.info(`(roomHandler) Player failed to join room due to ${result.error}`);
            socket.emit('joinRoom', {error: result.error});
        } else {
            logger.info('(roomHandler) Player joined room');
            const room = result.room;
            socket.join(room.name);
            socket.emit('joinRoom', {success: true, roomName: room.name});
            socket.emit('updatePlayers', {modifies: room.players, deletes: []});
            socket.to(room.name).emit('updatePlayers', {
                modifies: [room.players.find(p => p.name === name)],
                deletes: []
            });
            socket.emit('setOptions', room.state.getOptions());
            if (room.state.stage !== 'lobby') {
                socket.emit('midgameConnect', room.state.midgameConnect(socket.id, result.oldId));
                if(!result.oldId && room.state.stage === 'matching') {
                    socket.to(room.name).emit('matchesFound', [{player: socket.id, response: ''}])
                }
            }
        }
    });

    socket.on('disconnect', () => {
        logger.info('(roomHandler) Player joined room');
        disconnect(socket);
    });
};

function disconnect(socket) {
    let roomName = getRoomById(socket.id)?.name;
    disconnectPlayer(socket.id);
    // remove socket from room
    if (roomName) socket.leave(roomName);

    const room = getRoomByName(roomName);
    if (room) {
        const player = room.players.find(p => p.id === socket.id);
        // could be modified
        const leader = room.players.find(p => p.leader);
        socket.to(room.name).emit('updatePlayers', {modifies: [player, leader], deletes: []});
    } else {
        logger.info('(roomHandlers) Room closed');
    }
}

