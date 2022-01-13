
const {roomService} = require('../../models/rooms');
// 1 minute
//const TIMEOUT = 60 * 1000;
// 1 second
const TIMEOUT = 1000;
// 10 minutes
//const MAX_INACTIVITY = 10 * 60 * 1000;
// 30 seconds
const MAX_INACTIVITY = 30 * 1000;

module.exports = (io) => {
    setInterval(() => cleanup(io), TIMEOUT);
}

const cleanup = (io) => {
    const inactiveRoomNames = roomService(MAX_INACTIVITY);
    inactiveRoomNames.forEach((name) => {
        // send a kick event to all the players in that room
        io.to(name).emit('kickPlayer', {error: 'inactiveRoom'});
        io.in(name).socketsLeave(name);
    });
}