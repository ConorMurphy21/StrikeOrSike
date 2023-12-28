import { GameState } from '../../src/state/gameState';
import { assert } from 'chai';
import { Player, Room } from '../../src/state/rooms';
import { isOk, Result } from '../../src/types/result';
import { PollName } from '../../src/state/pollService';

describe('voteSkipPrompt tests', () => {
  // must be even
  const evenLen = 8;
  const players: Player[] = [];
  let gameState: GameState;

  beforeEach(() => {
    for (let i = 0; i < evenLen; i++) {
      players[i] = {
        id: i.toString(),
        name: i.toString(),
        leader: false,
        active: true
      };
    }
    players[0].leader = true;
    const room: Room = {
      name: 'test',
      lastActivity: 0,
      players,
      lang: 'en-CA',
      state: null
    };
    gameState = new GameState(room);
    gameState.options.promptSkipping = true;
  });

  it('VoteSkip Happy', (done) => {
    let result: Result<{ count: number; next: boolean }>;
    let i;
    gameState.registerPromptSkippedCb(done);
    gameState.beginNewPrompt();
    for (i = 0; i < Math.ceil(evenLen / 2); i++) {
      result = gameState.pollVote(i.toString(), PollName.SkipPrompt);

      if (isOk(result)) {
        assert.strictEqual(result.count, i + 1);
      } else {
        assert.fail();
      }
    }
    result = gameState.pollVote(i.toString(), PollName.SkipPrompt);
    if (isOk(result)) {
      assert.strictEqual(result.count, i + 1);
    } else {
      assert.fail();
    }
  });

  it('VoteSkip unvote', (done) => {
    let result;
    let i;
    gameState.registerPromptSkippedCb(done);
    gameState.beginNewPrompt();
    for (i = 0; i < Math.ceil(evenLen / 2); i++) {
      result = gameState.pollVote(i.toString(), PollName.SkipPrompt);
      if (isOk(result)) {
        assert.strictEqual(result.count, i + 1);
      } else {
        assert.fail();
      }
    }
    result = gameState.pollVote(i.toString(), PollName.SkipPrompt);
    if (isOk(result)) {
      assert.strictEqual(result.count, i - 1);
    } else {
      assert.fail();
    }
    result = gameState.pollVote(i.toString(), PollName.SkipPrompt);
    if (isOk(result)) {
      assert.strictEqual(result.count, i);
    } else {
      assert.fail();
    }
  });
});
