const {getRoomById} = require('../../models/rooms');
const {GameState} = require('../../models/gameState');
const Joi = require('joi');
const logger = require('../../logger/logger');

/*** handler validation schemas ***/
let setOptionsSchema = require('../../models/optionsSchema');

module.exports = (io, socket) => {
    /*** GAME STATE ENDPOINTS ***/
    socket.on('setOptions', (options, callback) => {
        const result = setOptionsSchema.validate(options, {stripUnknown: true});
        if (result.error) return;
        options = result.value;

        const room = roomIfLeader(socket.id);
        if (!room) return;
        room.state.options = {...room.state.options, ...options};
        io.to(room.name).emit('setOptions', room.state.getOptions());
        if (callback) callback({success: true});
    });

    socket.on('startGame', () => {
        const room = roomIfLeader(socket.id);
        if (!room) return;
        if (room.players.length < room.state.options.minPlayers) return;
        room.state = new GameState(room, room.state.options, room.state.prompts);
        registerCallbacks(io, room);
        beginPrompt(io, room);
    });

    socket.on('promptResponse', (response) => {
        if (Joi.string().max(60).validate(response).error) return;
        const room = getRoomById(socket.id);
        if (!room) return;
        const state = room.state;
        const result = state.acceptPromptResponse(socket.id, response);
        if (result.success) {
            socket.emit('promptResponse', result.response);
        }
    });

    // true to vote to skip, false to unvote to skip
    socket.on('pollVote', (pollName) => {
        if (Joi.string().validate(pollName).error) return;
        const room = getRoomById(socket.id);
        if (!room) return;
        const state = room.state;
        const result = state.pollVote(socket.id, pollName);
        if (result.success) {
            io.to(room.name).emit('setVoteCount', {pollName, count: result.count, next: result.next});
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
        if (Joi.string().max(60).validate(response).error) return;
        const room = getRoomById(socket.id);
        if (!room) return;
        const state = room.state;
        const result = state.acceptResponseSelection(socket.id, response);
        if (result.success) {
            beginMatching(io, room);
        }
    });

    socket.on('selectMatch', (match) => {
        if (Joi.string().max(60).allow('').validate(match).error) return;

        const room = getRoomById(socket.id);
        if (!room) return;
        const state = room.state;
        const result = state.acceptMatch(socket.id, match);
        if (result.success) {
            io.to(room.name).emit('matchesFound', [{player: socket.id, response: match}]);
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

    state.registerStartNextPromptCb(() => {
        beginPrompt(io, room);
    });

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

function beginPrompt(io, room) {
    const state = room.state;
    if (state.beginNewPrompt()) {
        io.to(room.name).emit('beginPrompt', state.prompt);
        const timeToWait = state.options.promptTimer ? state.options.promptTimer * 1000 + 3000 + 1000 : 500;
        state.promptTimeout = setTimeout(() => {
            beginSelection(io, room);
            // time to respond          + countdown + tolerance
        }, timeToWait);
    } else {
        io.to(room.name).emit('gameOver', state.gameOver());
    }
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
        io.to(room.name).emit('endRound');
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
    }
}

function beginMatching(io, room) {
    const state = room.state;
    io.to(room.name).emit('beginMatching', state.selectedResponse());
    const matches = state.matches();
    if (matches.length !== 0) {
        io.to(room.name).emit('matchesFound', state.matches());
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