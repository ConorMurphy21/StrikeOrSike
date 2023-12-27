import { getRoomById, Room } from '../state/rooms';
import { GameState } from '../state/gameState';
import { z } from 'zod';
import logger from '../logger/logger';

/*** handler validation schemas ***/
import { ApiResult, isErr, isOk, isSuccess } from '../types/result';
import { ConfigurableOptions, getConfigurableOptionsSchema } from '../state/options';
import { PollName } from '../state/pollService';
import { TypedServer, TypedSocket } from '../types/socketServerTypes';
import { Responses, Stage } from '../types/stateTypes';

const registerGameHandlers = (io: TypedServer, socket: TypedSocket) => {
  /*** GAME STATE ENDPOINTS ***/
  socket.on('setOptions', (options: ConfigurableOptions, callback?: (p: { success: boolean }) => void) => {
    const room = roomIfLeader(socket.id);
    if (!room) {
      logger.error('(gameHandlers) Set options attempted with no room');
      return;
    }
    const validationResult = z
      .object({ options: getConfigurableOptionsSchema(), callback: z.function().optional() })
      .safeParse({ options, callback });
    if (!validationResult.success) {
      logger.error('(gameHandlers) Invalid options schema used');
      return;
    }
    ({ options, callback } = validationResult.data);
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
    const validationResult = z.string().max(60).min(1).safeParse(response);
    if (!validationResult.success) {
      logger.warn('(gameHandlers) Prompt Response too large');
      return;
    }
    response = validationResult.data;
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
  socket.on('pollVote', (pollName: PollName) => {
    const validationResult = z.nativeEnum(PollName).safeParse(pollName);
    if (!validationResult.success) {
      logger.error('(gameHandlers) PollVote invalid format');
      return;
    }
    pollName = validationResult.data;
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
    const validationResult = z.boolean().safeParse(isStrike);
    if (!validationResult.success) {
      logger.error('(gameHandlers) isStrike invalid format');
      return;
    }
    isStrike = validationResult.data;
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
    const validationResult = z.string().max(60).min(1).safeParse(response);
    if (!validationResult.success) {
      logger.error('(gameHandlers) selectResponse attempted with invalid match');
      return;
    }
    response = validationResult.data;

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
    const validationResult = z.string().max(60).safeParse(match);
    if (!validationResult.success) {
      logger.error('(gameHandlers) selectMatch attempted with invalid match');
      return;
    }
    match = validationResult.data;
    const room = getRoomById(socket.id);
    if (!room) {
      logger.error('(gameHandlers) selectMatch attempted with no room');
      return;
    }
    const state = room.state!;
    const result = state.acceptMatch(socket.id, match);
    if (isSuccess(result)) {
      io.to(room.name).emit('matchesFound', [{ player: socket.id, response: match, exact: false }]);
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

  // todo: change client side to accept Result type instead of this dumb ApiResult
  socket.on('getResponses', (id: string, callback: (result: ApiResult<Responses>) => void) => {
    const validationResult = z.object({ id: z.string(), callback: z.function() }).safeParse({ id, callback });
    if (!validationResult.success) {
      logger.error('(gameHandlers) getResponses attempted with invalid arguments');
      return;
    }
    ({ id, callback } = validationResult.data);
    const room = getRoomById(socket.id);
    if (!room) {
      logger.error('(gameHandlers) getResponses attempted with no room');
      return;
    }
    const state = room.state!;
    const result = state.getResponses(id);
    if (isErr(result)) {
      logger.log(result.wrap('(gameHandlers) getResponses failed due to %1$s'));
      callback({ success: true, ...result });
    } else {
      callback({ success: true, ...result });
    }
  });
};

function registerCallbacks(io: TypedServer, room: Room) {
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

function beginPrompt(io: TypedServer, room: Room) {
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

function skipPrompt(io: TypedServer, room: Room) {
  const state = room.state!;
  if (state.promptTimeout) {
    clearTimeout(state.promptTimeout);
    state.promptTimeout = null;
  }
  beginPrompt(io, room);
}

function beginSelection(io: TypedServer, room: Room) {
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

function continueSelection(io: TypedServer, room: Room) {
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

function applyDisputeAction(io: TypedServer, room: Room, action: string) {
  if (action === 'reSelect') {
    io.to(room.name).emit('nextSelection', {
      selector: room.state!.selectorId(),
      selectionType: room.state!.selectionType
    });
  } else if (action === 'nextSelection') {
    continueSelection(io, room);
  }
}

function beginMatching(io: TypedServer, room: Room) {
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

function midgameJoin(socket: TypedSocket, room: Room, oldId?: string) {
  socket.emit('midgameConnect', room.state!.midgameConnect(socket.id, oldId));
  if (room.state!.stage === Stage.Matching) {
    const match = room.state!.getMatch(socket.id);
    if (match) {
      // exact only matters if it's the original user
      socket.to(room.name).emit('matchesFound', [{ player: socket.id, response: match, exact: true }]);
    }
  }
}

export { registerGameHandlers, midgameJoin };
