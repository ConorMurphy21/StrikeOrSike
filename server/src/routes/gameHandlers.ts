import { getRoomById, Room } from '../state/rooms';
import { GameState } from '../state/gameState';
import Joi from 'joi';
import logger from '../logger/logger';
import { Server, Socket } from 'socket.io';

/*** handler validation schemas ***/
import setOptionsSchema from '../types/optionsSchema';
import { isErr, isOk, isSuccess } from '../types/result';

const registerGameHandlers = (io: Server, socket: Socket) => {
  /*** GAME STATE ENDPOINTS ***/
  socket.on('setOptions', (options, callback) => {
    const room = roomIfLeader(socket.id);
    if (!room) {
      logger.error('(gameHandlers) Set options attempted with no room');
      return;
    }
    const result = setOptionsSchema.validate(options, { stripUnknown: true });
    if (result.error) {
      logger.error('(gameHandlers) Invalid options schema used');
      return;
    }
    options = result.value;
    room.state!.options = { ...room.state!.options, ...options };
    io.to(room.name).emit('setOptions', room.state!.getOptions());
    if (callback) callback({ success: true });
  });

  socket.on('startGame', () => {
    const room = roomIfLeader(socket.id);
    if (!room) {
      logger.error('(gameHandlers) Game start attempted with no room');
      return;
    }
    if (room.players.length < room.state!.options.minPlayers) {
      logger.error('(gameHandlers) Game start attempted with too few players');
      return;
    }
    logger.info('(gameHandlers) Game started');
    room.state = new GameState(room, room.state!.options, room.state!.prompts);
    registerCallbacks(io, room);
    beginPrompt(io, room);
  });

  socket.on('promptResponse', (response: string) => {
    if (Joi.string().max(60).min(1).required().validate(response).error) {
      logger.error('(gameHandlers) Prompt Response too large');
      return;
    }
    const room = getRoomById(socket.id);
    if (!room) {
      logger.error('(gameHandlers) PromptResponse attempted with no room');
      return;
    }
    const state = room.state!;
    const result = state.acceptPromptResponse(socket.id, response);
    if (isOk(result)) {
      socket.emit('promptResponse', result.response);
    } else {
      logger.log(result.wrap('(gameHandlers) PromptResponse failed due to %1$s'));
    }
  });

  // true to vote to skip, false to unvote to skip
  socket.on('pollVote', (pollName: string) => {
    if (Joi.string().required().validate(pollName).error) {
      logger.error('(gameHandlers) PollVote invalid format');
      return;
    }
    const room = getRoomById(socket.id);
    if (!room) {
      logger.error('(gameHandlers) PollVote attempted with no room');
      return;
    }
    const state = room.state!;
    const result = state.pollVote(socket.id, pollName);
    if (isOk(result)) {
      io.to(room.name).emit('setVoteCount', {
        pollName,
        count: result.count,
        next: result.next
      });
    } else {
      logger.log(result.wrap('(gameHandlers) pollVote failed due to %1$s'));
    }
  });

  socket.on('selectSelectionType', (isStrike: boolean) => {
    if (Joi.boolean().required().validate(isStrike).error) {
      logger.error('(gameHandlers) isStrike invalid format');
      return;
    }
    const room = getRoomById(socket.id);
    if (!room) {
      logger.error('(gameHandlers) selectSelectionType attempted with no room');
      return;
    }
    const state = room.state!;
    const result = state.acceptSelectionType(socket.id, isStrike);
    if (isSuccess(result)) {
      io.to(room.name).emit('selectionTypeChosen', state.selectionType);
    } else {
      logger.log(result.wrap('(gameHandlers) selectSelectionType failed due to %1$s'));
    }
  });

  socket.on('selectResponse', (response: string) => {
    if (Joi.string().max(60).min(1).required().validate(response).error) {
      logger.error('(gameHandlers) selectResponse attempted with invalid match');
      return;
    }
    const room = getRoomById(socket.id);
    if (!room) {
      logger.error('(gameHandlers) selectResponse attempted with no room');
      return;
    }
    const state = room.state!;
    const result = state.acceptResponseSelection(socket.id, response);
    if (isSuccess(result)) {
      beginMatching(io, room);
    } else {
      logger.log(result.wrap('(gameHandlers) selectResponse failed due to %1$s'));
    }
  });

  socket.on('selectMatch', (match: string) => {
    if (Joi.string().max(60).allow('').required().validate(match).error) {
      logger.error('(gameHandlers) selectMatch attempted with invalid match');
      return;
    }
    const room = getRoomById(socket.id);
    if (!room) {
      logger.error('(gameHandlers) selectMatch attempted with no room');
      return;
    }
    const state = room.state!;
    const result = state.acceptMatch(socket.id, match);
    if (isSuccess(result)) {
      io.to(room.name).emit('matchesFound', [{ player: socket.id, response: match }]);
    } else {
      logger.log(result.wrap('(gameHandlers) selectMatch failed due to %1$s'));
    }
  });

  socket.on('selectionComplete', () => {
    const room = getRoomById(socket.id);
    if (!room) {
      logger.error('(gameHandlers) selectionComplete attempted with no room');
      return;
    }
    const state = room.state!;
    if (state.matchingComplete() && state.isSelector(socket.id)) {
      state.selectionComplete();
      continueSelection(io, room);
    } else {
      logger.error('(gameHandlers) selectionComplete attempted at wrong stage');
    }
  });

  socket.on('getResponses', (id, callback) => {
    if (!callback || !Joi.string().required().validate(id)) {
      logger.error('(gameHandlers) getResponse attempted with invalid arguments');
      return;
    }
    const room = getRoomById(socket.id);
    if (!room) {
      logger.error('(gameHandlers) getResponses attempted with no room');
      return;
    }
    const state = room.state!;
    const result = state.getResponses(id);
    if (isErr(result)) {
      logger.log(result.wrap('(gameHandlers) getResponses failed due to %1$s'));
    }
    if (callback) callback(result);
  });
};

function registerCallbacks(io: Server, room: Room) {
  const state = room.state!;

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

function beginPrompt(io: Server, room: Room) {
  const state = room.state!;
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

function skipPrompt(io: Server, room: Room) {
  const state = room.state!;
  if (state.promptTimeout) {
    clearTimeout(state.promptTimeout);
    state.promptTimeout = null;
  }
  beginPrompt(io, room);
}

function beginSelection(io: Server, room: Room) {
  const state = room.state!;
  if (state.beginSelection()) {
    io.to(room.name).emit('nextSelection', {
      selector: state.selectorId(),
      selectionType: state.selectionType
    });
  } else {
    beginPrompt(io, room);
  }
}

function continueSelection(io: Server, room: Room) {
  const state = room.state!;
  if (state.nextSelection()) {
    io.to(room.name).emit('nextSelection', {
      selector: state.selectorId(),
      selectionType: state.selectionType
    });
  } else {
    io.to(room.name).emit('endRound', {
      hasNextRound: state.hasNewPrompt()
    });
  }
}

function applyDisputeAction(io: Server, room: Room, action: string) {
  if (action === 'reSelect') {
    io.to(room.name).emit('nextSelection', {
      selector: room.state!.selectorId(),
      selectionType: room.state!.selectionType
    });
  } else if (action === 'nextSelection') {
    continueSelection(io, room);
  }
}

function beginMatching(io: Server, room: Room) {
  const state = room.state!;
  io.to(room.name).emit('beginMatching', state.selectedResponse());
  const matches = state.matches();
  if (matches.length !== 0) {
    io.to(room.name).emit('matchesFound', state.matches());
  }
}

// return the room only if the user is the party leader
function roomIfLeader(id: string): Room | undefined {
  const room = getRoomById(id);
  if (!room) return;
  const player = room.players.find((p) => p.id === id);
  if (!player || !player.leader) return;
  return room;
}

function midgameJoin(socket: Socket, room: Room, oldId?: string) {
  socket.emit('midgameConnect', room.state!.midgameConnect(socket.id, oldId));
  if (room.state!.stage === 'matching') {
    const match = room.state!.getMatch(socket.id);
    if (match) {
      // exact only matters if it's the original user
      socket.to(room.name).emit('matchesFound', [{ player: socket.id, response: match, exact: true }]);
    }
  }
}

export { registerGameHandlers, midgameJoin };
