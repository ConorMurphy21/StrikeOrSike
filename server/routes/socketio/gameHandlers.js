const {getRoomById} = require("../../models/rooms");
const GameState = require("../../models/gameState");
module.exports = (io, socket) => {
    /*** GAME STATE ENDPOINTS ***/

    socket.on("setOptions", (options, callback) => {
        const room = roomIfLeader(socket.id);
        if (!room) return;
        // todo: validation
        room.state.options = {options};
        callback({success: true});
    });

    socket.on("startGame", () => {
        const room = roomIfLeader(socket.id);
        if (!room) return;
        room.state = new GameState(room, room.state.options);
        registerCallbacks(io, room);
        beginPrompt(io, room);
    });

    socket.on("promptResponse", (response) => {
        const room = getRoomById(socket.id);
        if(!room) return;
        const state = room.state;
        const result = state.acceptPromptResponse(socket.id, response);
        if (result.success) {
            socket.emit("promptResponse", response);
        }
    });

    socket.on("selectResponse", (response) => {
        const room = getRoomById(socket.id);
        if(!room) return;
        const state = room.state;
        const result = state.acceptResponseSelection(socket.id, response);
        if (result.success) {
            io.to(room.name).emit("beginMatching", response);
            state.players.forEach(player => {
               if(player.matchingComplete){
                   io.to(room.name).emit("matchFound", {player: player.id, response: player.match});
               }
            });
        }
    });

    socket.on("selectMatch", (match) => {
        const room = getRoomById(socket.id);
        if(!room) return;
        const state = room.state;
        const result = state.acceptMatch(socket.id, match);
        if(result.success){
            io.to(room.name).emit("matchFound", {player: socket.id, response: match});
        }
    });

    socket.on("selectionComplete", () => {
        const room = getRoomById(socket.id);
        if(!room) return;
        const state = room.state;
        if(state.matchingComplete() && state.isSelector(socket.id)){
            continueSelection(io, room);
        }
    });
}

function registerCallbacks(io, room){
    room.state.registerMatchingCompleteCb((selectorActive) => {
        // give a little time to show score before moving on to next selection
        if(!selectorActive) {
            setTimeout(() => {
                continueSelection(io, room);
            }, 5000);
        }
    });
    room.state.registerSelectionUnsuccessfulCb(() => {
        continueSelection(io, room);
    });
}

function beginPrompt(io, room) {
    const state = room.state;

    if(state.beginNewPrompt()) {
        io.to(room.name).emit("beginPrompt", {
            prompt: state.prompt,
            timer: state.options.promptTimer
        });
        setTimeout(() => {
            beginSelection(io, room);
        }, state.options.promptTimer * 1000 + 1000);
    } else {
        io.to(room.name).emit("gameOver");
    }
}

function beginSelection(io, room) {
    const state = room.state;
    state.beginSelection();
    io.to(room.name).emit("nextSelection",
        {
            selector: state.players[state.selector].id,
            selectionType: state.selectionType
        });
}

function continueSelection(io, room) {
    const state = room.state;
    if (state.nextSelection()) {
        io.to(room.name).emit("nextSelection",
            {
                selector: state.players[state.selector].id,
                selectionType: state.selectionType
            });
    } else {
        beginPrompt(io, room);
    }
}

// return the room only if the user is the party leader
function roomIfLeader(id) {
    let room = getRoomById(id);
    if (!room) return;
    const player = room.players.find(p => p.id === id);
    if (!player.leader) return;
    return room;
}
