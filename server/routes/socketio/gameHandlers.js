const {getRoomById} = require("../../models/rooms");
const {createDefaultState, defaultOptions, getStateById, beginNewPrompt} = require("../../models/gameState");
module.exports = (io, socket) => {
    /*** GAME STATE ENDPOINTS ***/

    socket.on("startGame", () => {
        const room = roomIfLeader(socket.id);
        if (!room) return;
        const state = createDefaultState(room, defaultOptions());
        beginPrompt(io, state, room.name);
    });

    socket.on("promptResponse", (response) => {
        const state = getStateById(socket.id);
        if(state.stage === "response") {
            const playerState = state.players.find(player => player.id === socket.id);
            playerState.responses.push(response);
        }
    });
}

function beginPrompt(io, state, roomName){
    beginNewPrompt(state);
    io.to(roomName).emit("beginPrompt", {
        prompt: state.prompt,
        timer: state.options.promptTimer
    });
    setTimeout(() => {
        state.stage = 'selection';
        activeSelection(io, state, roomName);
    }, state.options.promptTimer * 1000 + 1000);
}

function activeSelection(io, state, roomName){

}

// return the room only if the user is the party leader
function roomIfLeader(id) {
    let room = getRoomById(id);
    if (!room) return;
    const player = room.players.find(p => p.id === id);
    if (!player.leader) return;
    return room;
}
