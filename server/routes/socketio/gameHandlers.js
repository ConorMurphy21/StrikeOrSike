const {getRoomById} = require("../../models/rooms");
const {beginNewPrompt, createDefaultState} = require("../../models/gameState");
module.exports = (io, socket) => {
    /*** GAME STATE ENDPOINTS ***/

    socket.on("setOptions", (options, callback) => {
        const room = roomIfLeader(socket.id);
        if(!room) return;
        // todo: validation
        room.state.options = options;
        callback({
            success: true
        })
    });

    socket.on("startGame", () => {
        const room = roomIfLeader(socket.id);
        if (!room) return;
        room.state = createDefaultState(room, room.state.options);
        beginPrompt(io, room.state, room.name);
    });

    socket.on("promptResponse", (response) => {
        const state = getRoomById(socket.id).state;
        if(state.stage === "response") {
            const playerState = state.players.find(player => player.id === socket.id);
            //TODO: check for collisions (no reason to add a word if it is already there)
            playerState.responses.push(response);
            socket.emit("promptResponse", response);
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
