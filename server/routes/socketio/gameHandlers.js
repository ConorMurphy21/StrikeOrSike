const {getRoomById} = require('../../models/rooms');
const {GameState} = require('../../models/gameState');
module.exports = (io, socket) => {
    /*** GAME STATE ENDPOINTS ***/

    socket.on('setOptions', (options, callback) => {
        const room = roomIfLeader(socket.id);
        if (!room) return;
        // todo: validation
        room.state.options = options;
        callback({success: true});
    });

    socket.on('startGame', () => {
        const room = roomIfLeader(socket.id);
        if (!room) return;
        room.state = new GameState(room, room.state.options);
        registerCallbacks(io, room);
        setOptions(io, room);
        beginPrompt(io, room);
    });

    socket.on('promptResponse', (response) => {
        const room = getRoomById(socket.id);
        if (!room) return;
        const state = room.state;
        const result = state.acceptPromptResponse(socket.id, response);
        if (result.success) {
            socket.emit('promptResponse', response);
        }
    });

    // true to vote to skip, false to unvote to skip
    socket.on('voteSkipPrompt', (vote) => {
        const room = getRoomById(socket.id);
        if (!room) return;
        const state = room.state;
        const result = state.voteSkipPrompt(socket.id, vote);
        if (result.success) {
            if (result.skip) {
                skipPrompt(io, room);
            } else {
                io.to(room.name).emit('setSkipVoteCount', result.count);
            }
        }
    });

    socket.on('selectSelectionType', (isStrike) => {
        const room = getRoomById(socket.id);
        if (!room) return;
        const state = room.state;
        const result = state.acceptSelectionType(socket.id, isStrike);
        if (result.success) {
            io.to(room.name).emit('selectionTypeChosen', state.selectionType);
        }
    });

    socket.on('selectResponse', (response) => {
        const room = getRoomById(socket.id);
        if (!room) return;
        const state = room.state;
        const result = state.acceptResponseSelection(socket.id, response);
        if (result.success) {
            if (result.stage === 'responseMatching') {
                beginMatching(io, room);
            } else if (result.stage === 'sikeDispute') {
                io.to(room.name).emit('beginDispute', response);
            }
        }
    });

    socket.on('sikeVote', (vote) => {
        const room = getRoomById(socket.id);
        if (!room) return;
        const state = room.state;
        const result = state.acceptSikeDisputeVote(socket.id, vote);
        if (result.success) {
            applyDisputeAction(io, room, result.action);
        }
    });

    socket.on('selectMatch', (match) => {
        const room = getRoomById(socket.id);
        if (!room) return;
        const state = room.state;
        const result = state.acceptMatch(socket.id, match);
        if (result.success) {
            io.to(room.name).emit('matchFound', {player: socket.id, response: match});
        }
    });

    socket.on('selectionComplete', () => {
        const room = getRoomById(socket.id);
        if (!room) return;
        const state = room.state;
        if (state.matchingComplete() && state.isSelector(socket.id)) {
            continueSelection(io, room);
        }
    });
}

function registerCallbacks(io, room) {
    const state = room.state;

    state.registerPromptSkippedCb(() => {
        skipPrompt(io, room);
    });

    state.registerSelectionUnsuccessfulCb(() => {
        continueSelection(io, room);
    });

    state.registerDisputeCompleteCb((action) => {
        applyDisputeAction(io, room, action);
    });

    state.registerMatchingCompleteCb((selectorActive) => {
        // give a little time to show score before moving on to next selection
        if (!selectorActive) {
            state.promptTimeout = setTimeout(() => {
                continueSelection(io, room);
            }, 5000);
        }
    });
}

function setOptions(io, room) {
    const state = room.state;
    io.to(room.name).emit('setOptions', {
        promptSkipping: state.options.promptSkipping
    });
}

function beginPrompt(io, room) {
    const state = room.state;
    state.beginNewPrompt().then(contGame => {
        if (contGame) {
            io.to(room.name).emit('beginPrompt', {
                prompt: state.prompt,
                timer: state.options.promptTimer
            });
            state.promptTimeout = setTimeout(() => {
                beginSelection(io, room);
            }, state.options.promptTimer * 1000 + 1000);
        } else {
            io.to(room.name).emit('gameOver');
        }
    });
}

function skipPrompt(io, room) {
    const state = room.state;
    if (state.promptTimeout) {
        clearTimeout(state.promptTimeout);
        state.promptTimeout = null;
    }
    beginPrompt(io, room);
}

function beginSelection(io, room) {
    const state = room.state;
    if (state.beginSelection()) {
        io.to(room.name).emit('nextSelection',
            {
                selector: state.selectorId(),
                selectionType: state.selectionType
            });
    } else {
        beginPrompt(io, room);
    }
}

function continueSelection(io, room) {
    const state = room.state;
    if (state.nextSelection()) {
        io.to(room.name).emit('nextSelection',
            {
                selector: state.selectorId(),
                selectionType: state.selectionType
            });
    } else {
        beginPrompt(io, room);
    }
}

function applyDisputeAction(io, room, action) {
    if (action === 'reSelect') {
        io.to(room.name).emit('nextSelection',
            {
                selector: room.state.selectorId(),
                selectionType: room.state.selectionType
            });
    } else if (action === 'nextSelection') {
        continueSelection(io, room);
    } else if (action === 'beginMatching') {
        beginMatching(io, room);
    }
}

function beginMatching(io, room) {
    const state = room.state;
    io.to(room.name).emit('beginMatching', state.selectedResponse());
    for (const player of state.players) {
        if (player.matchingComplete) {
            // todo: turn this into 1 message to reduce network traffic
            io.to(room.name).emit('matchFound', {player: player.id, response: player.match});
        }
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