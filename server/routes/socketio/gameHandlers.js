const {getRoomById} = require('../../models/rooms');
const {GameState} = require('../../models/gameState');
const Joi = require('joi');
const logger = require('../../logger/logger');

/*** handler validation schemas ***/
let setOptionsSchema = require('../../models/optionsSchema');

const registerGameHandlers = (io, socket) => {
    /*** GAME STATE ENDPOINTS ***/
    socket.on('setOptions', (options, callback) => {
        const room = roomIfLeader(socket.id);
        if (!room) {
            logger.error('(gameHandlers) Set options attempted with no room');
            return;
        }
        const result = setOptionsSchema.validate(options, {stripUnknown: true});
        if (result.error) {
            logger.error('(gameHandlers) Invalid options schema used');
            return;
        }
        options = result.value;
        room.state.options = {...room.state.options, ...options};
        io.to(room.name).emit('setOptions', room.state.getOptions());
        if (callback) callback({success: true});
    });

    socket.on('startGame', () => {
        const room = roomIfLeader(socket.id);
        if (!room) {
            logger.error('(gameHandlers) Game start attempted with no room');
            return;
        }
        if (room.players.length < room.state.options.minPlayers) {
            logger.error('(gameHandlers) Game start attempted with too few players');
            return;
        }
        logger.info('(gameHandlers) Game started');
        room.state = new GameState(room, room.state.options, room.state.prompts);
        registerCallbacks(io, room);
        beginPrompt(io, room);
    });

    socket.on('promptResponse', (response) => {
        if (Joi.string().max(60).validate(response).error) {
            logger.error('(gameHandlers) Prompt Response too large')
            return;
        }
        const room = getRoomById(socket.id);
        if (!room) {
            logger.error('(gameHandlers) PromptResponse attempted with no room');
            return;
        }
        const state = room.state;
        const result = state.acceptPromptResponse(socket.id, response);
        if (result.success) {
            socket.emit('promptResponse', result.response);
        } else {
            logger.error(`(gameHandlers) PromptResponse failed due to ${result.error}`);
        }
    });

    // true to vote to skip, false to unvote to skip
    socket.on('pollVote', (pollName) => {
        if (Joi.string().validate(pollName).error) {
            logger.error('(gameHandlers) PollVote invalid format');
            return;
        }
        const room = getRoomById(socket.id);
        if (!room) {
            logger.error('(gameHandlers) PollVote attempted with no room');
            return;
        }
        const state = room.state;
        const result = state.pollVote(socket.id, pollName);
        if (result.success) {
            io.to(room.name).emit('setVoteCount', {pollName, count: result.count, next: result.next});
        } else {
            logger.error(`(gameHandlers) pollVote failed due to ${result.error}`);
        }
    });

    socket.on('selectSelectionType', (isStrike) => {
        const room = getRoomById(socket.id);
        if (!room) {
            logger.error('(gameHandlers) selectSelectionType attempted with no room');
            return;
        }
        const state = room.state;
        const result = state.acceptSelectionType(socket.id, isStrike);
        if (result.success) {
            io.to(room.name).emit('selectionTypeChosen', state.selectionType);
        } else {
            logger.error(`(gameHandlers) selectSelectionType failed due to ${result.error}`);
        }
    });

    socket.on('selectResponse', (response) => {
        if (Joi.string().max(60).validate(response).error) {
            logger.error('(gameHandlers) selectResponse attempted with invalid match');
            return;
        }
        const room = getRoomById(socket.id);
        if (!room) {
            logger.error('(gameHandlers) selectResponse attempted with no room');
            return;
        }
        const state = room.state;
        const result = state.acceptResponseSelection(socket.id, response);
        if (result.success) {
            beginMatching(io, room);
        } else {
            logger.error(`(gameHandlers) selectResponse failed due to ${result.error}`);
        }
    });

    socket.on('selectMatch', (match) => {
        if (Joi.string().max(60).allow('').validate(match).error) {
            logger.error('(gameHandlers) selectMatch attempted with invalid match');
            return;
        }
        const room = getRoomById(socket.id);
        if (!room) {
            logger.error('(gameHandlers) selectMatch attempted with no room');
            return;
        }
        const state = room.state;
        const result = state.acceptMatch(socket.id, match);
        if (result.success) {
            io.to(room.name).emit('matchesFound', [{player: socket.id, response: match}]);
        } else {
            logger.error(`(gameHandlers) selectMatch failed due to ${result.error}`);
        }
    });

    socket.on('selectionComplete', () => {
        const room = getRoomById(socket.id);
        if (!room) {
            logger.error('(gameHandlers) selectionComplete attempted with no room');
            return;
        }
        const state = room.state;
        if (state.matchingComplete() && state.isSelector(socket.id)) {
            room.state.selectionComplete();
            continueSelection(io, room);
        } else {
            logger.error('(gameHandlers) selectionComplete attempted at wrong stage');
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
        logger.info('(gameHandlers) game over');
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
        io.to(room.name).emit('endRound', {
            hasNextRound: state.hasNewPrompt()
        });
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

function midgameJoin(socket, room, oldId) {
    socket.emit('midgameConnect', room.state.midgameConnect(socket.id, oldId));
    if(room.state.stage === 'matching') {
        const match = room.state.getMatch(socket.id);
        if(match !== undefined) {
            // exact only matters if it's the original user
            socket.to(room.name).emit('matchesFound', [{player: socket.id, response: match, exact: true}]);
        }
    }
}

module.exports = {registerGameHandlers, midgameJoin};