const registerRoomHandlers = require('./roomHandlers');
const {registerGameHandlers} = require('./gameHandlers');

module.exports = (io, socket) => {
    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);
}