import { GameState } from '../../src/state/gameState';
import { assert } from 'chai';
import { isErr, isSuccess } from ':common/result';
import { Player } from ':common/stateTypes';

describe('Sike Dispute tests', () => {
  const selectorId = '0';
  const matcherId = '1';
  const selectorIndex = 0;
  const matcherIndex = 1;
  let gameState: GameState;
  const firstResponse = 'firstResponse';
  const secondResponse = 'secondResponse';
  // must be even
  const evenLen = 8;
  const players: Player[] = [];

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
    const room = {
      name: 'test',
      lastActivity: 0,
      players,
      lang: 'en-CA',
      state: null
    };
    gameState = new GameState(room);
    gameState.options.sikeDispute = true;
    gameState.players[selectorIndex].responses.push(firstResponse);
    gameState.players[selectorIndex].responses.push(secondResponse);
  });

  describe('Strike selectionType', () => {
    beforeEach(() => {
      gameState.beginSelection();
      gameState.selectionType = 'strike';
    });

    it('PromptSelection Accept Happy', () => {
      const result = gameState.acceptResponseSelection(selectorId, firstResponse);
      assert.isOk(isSuccess(result));
    });

    it('PromptSelection Accept NotSelector', () => {
      gameState.players[matcherIndex].responses.push(firstResponse);
      const result = gameState.acceptResponseSelection(matcherId, firstResponse);
      assert.isOk(isErr(result));
    });

    it('PromptSelection Accept used', () => {
      gameState.players[selectorIndex].used.push(firstResponse);
      const result = gameState.acceptResponseSelection(selectorId, firstResponse);
      assert.isOk(isErr(result));
    });
  });

  /*describe('Sike selectionType', () => {
    beforeEach(() => {
      gameState.options.sikeRetries = 0;
      gameState.beginSelection();
      gameState.selectionType = 'sike';
    });

    it('PromptSelection Accept Happy', () => {
      const result = gameState.acceptResponseSelection(selectorId, firstResponse);
      assert.isOk(isSuccess(result));
    });

    it('Dispute vote in favor', () => {
      gameState.acceptResponseSelection(selectorId, firstResponse);
      for (let i = 1; i < evenLen - 1; i++) {
        const result = gameState.acceptSikeDisputeVote(i.toString(), !!(i % 2));
        assert.isOk(isSuccess(result));
        assert.strictEqual(result.action, 'noOp');
      }
      const result = gameState.acceptSikeDisputeVote((evenLen - 1).toString(), true);
      assert.isOk(isSuccess(result));
      assert.strictEqual(result.action, 'beginMatching');
    });

    it('Dispute vote against', () => {
      gameState.acceptResponseSelection(selectorId, firstResponse);
      for (let i = 1; i < evenLen - 1; i++) {
        const result = gameState.acceptSikeDisputeVote(i.toString(), !(i % 2));
        assert.isOk(isSuccess(result));
        assert.strictEqual(result.action, 'noOp');
      }
      const result = gameState.acceptSikeDisputeVote((evenLen - 1).toString(), false);
      assert.isOk(isSuccess(result));
      assert.strictEqual(result.action, 'nextSelection');
    });

    it('no double counting votes', () => {
      gameState.acceptResponseSelection(selectorId, firstResponse);
      for (let i = 0; i < evenLen; i++) {
        const result = gameState.acceptSikeDisputeVote('2', true);
        assert.isOk(isSuccess(result));
        assert.strictEqual(result.action, 'noOp');
      }
    });

    it('BadRequest Self Vote', () => {
      gameState.acceptResponseSelection(selectorId, firstResponse);
      const countBefore = gameState.sikeDisputeUpVotes;
      const result = gameState.acceptSikeDisputeVote('0', true);
      assert.isNotOk('success' in result);
      assert.isOk(isErr(result));
      assert.strictEqual(gameState.sikeDisputeUpVotes, countBefore);
    });

    it('Dispute vote in favor w inactivity', () => {
      gameState.acceptResponseSelection(selectorId, firstResponse);
      for (let i = 1; i < evenLen - 1; i++) {
        const result = gameState.acceptSikeDisputeVote(i.toString(), !!(i % 2));
        assert.isOk(isSuccess(result));
        assert.strictEqual(result.action, 'noOp');
      }
      const result = gameState.acceptSikeDisputeVote((evenLen - 1).toString(), true);
      assert.isOk(isSuccess(result));
      assert.strictEqual(result.action, 'beginMatching');
    });

    it('Dispute vote in favor w inactive', () => {
      gameState.acceptResponseSelection(selectorId, firstResponse);
      for (let i = 1; i < evenLen - 3; i++) {
        players[i].active = false;
      }
      gameState.acceptSikeDisputeVote((evenLen - 2).toString(), true);
      const result = gameState.acceptSikeDisputeVote((evenLen - 1).toString(), true);
      assert.isOk(isSuccess(result));
      assert.strictEqual(result.action, 'beginMatching');
    });

    it('Dispute vote in favor evenVoters', () => {
      gameState.acceptResponseSelection(selectorId, firstResponse);
      players.splice(evenLen - 1, 1);
      const nVoters = evenLen - 2;
      for (let i = 1; i < nVoters / 2 + 1; i++) {
        const result = gameState.acceptSikeDisputeVote(i.toString(), false);
        assert.isOk(isSuccess(result));
        assert.strictEqual(result.action, 'noOp');
      }
      for (let i = nVoters / 2 + 1; i < evenLen - 2; i++) {
        const result = gameState.acceptSikeDisputeVote(i.toString(), true);
        assert.isOk(isSuccess(result));
        assert.strictEqual(result.action, 'noOp');
      }
      const result = gameState.acceptSikeDisputeVote((evenLen - 2).toString(), true);
      assert.isOk(isSuccess(result));
      assert.strictEqual(result.action, 'beginMatching');
    });

    it('Dispute vote against evenVoters', () => {
      gameState.acceptResponseSelection(selectorId, firstResponse);
      players.splice(evenLen - 1, 1);
      const nVoters = evenLen - 2;
      for (let i = 1; i < nVoters / 2; i++) {
        const result = gameState.acceptSikeDisputeVote(i.toString(), true);
        assert.isOk(isSuccess(result));
        assert.strictEqual(result.action, 'noOp');
      }
      for (let i = nVoters / 2; i < evenLen - 2; i++) {
        const result = gameState.acceptSikeDisputeVote(i.toString(), false);
        assert.isOk(isSuccess(result));
        assert.strictEqual(result.action, 'noOp');
      }
      const result = gameState.acceptSikeDisputeVote((evenLen - 2).toString(), false);
      assert.isOk(isSuccess(result));
      assert.strictEqual(result.action, 'nextSelection');
    });
  });
  describe('Sike selectionType w retries', () => {
    beforeEach(() => {
      gameState.options.sikeRetries = 1;
      gameState.beginSelection();
      gameState.selectionType = 'sike';
    });

    it('Dispute vote against with retries happy', () => {
      gameState.acceptResponseSelection(selectorId, firstResponse);
      for (let i = 1; i < evenLen - 1; i++) {
        const result = gameState.acceptSikeDisputeVote(i.toString(), !(i % 2));
        assert.isOk(isSuccess(result));
        assert.strictEqual(result.action, 'noOp');
      }
      let result = gameState.acceptSikeDisputeVote((evenLen - 1).toString(), false);
      assert.isOk(isSuccess(result));
      assert.strictEqual(result.action, 'reSelect');

      // reselect valid response
      gameState.acceptResponseSelection(selectorId, secondResponse);
      for (let i = 1; i < evenLen - 1; i++) {
        const result = gameState.acceptSikeDisputeVote(i.toString(), !(i % 2));
        assert.isOk(isSuccess(result));
        assert.strictEqual(result.action, 'noOp');
      }
      result = gameState.acceptSikeDisputeVote((evenLen - 1).toString(), false);
      assert.isOk(isSuccess(result));
      assert.strictEqual(result.action, 'nextSelection');
    });

    it('Dispute vote against with retries inactive selector', () => {
      gameState.acceptResponseSelection(selectorId, firstResponse);
      players[selectorIndex].active = false;
      gameState.disconnect(selectorId);

      for (let i = 1; i < evenLen - 1; i++) {
        const result = gameState.acceptSikeDisputeVote(i.toString(), !(i % 2));
        assert.isOk(isSuccess(result));
        assert.strictEqual(result.action, 'noOp');
      }
      let result = gameState.acceptSikeDisputeVote((evenLen - 1).toString(), false);
      assert.isOk(isSuccess(result));
      assert.strictEqual(result.action, 'nextSelection');
    });

    it('Dispute vote with retries no other selections', () => {
      gameState.players[selectorIndex].responses = [firstResponse];
      gameState.acceptResponseSelection(selectorId, firstResponse);
      for (let i = 1; i < evenLen - 1; i++) {
        const result = gameState.acceptSikeDisputeVote(i.toString(), !(i % 2));
        assert.isOk(isSuccess(result));
        assert.strictEqual(result.action, 'noOp');
      }
      let result = gameState.acceptSikeDisputeVote((evenLen - 1).toString(), false);
      assert.isOk(isSuccess(result));
      assert.strictEqual(result.action, 'nextSelection');
    });

    it('Dispute vote against with retries reuse selection', () => {
      gameState.acceptResponseSelection(selectorId, firstResponse);
      for (let i = 1; i < evenLen - 1; i++) {
        const result = gameState.vote('sikeDispute', i.toString());
        assert.isOk(isSuccess(result));
        assert.strictEqual(result.action, 'noOp');
      }
      let result = gameState.acceptSikeDisputeVote((evenLen - 1).toString(), false);
      assert.isOk(isSuccess(result));
      assert.strictEqual(result.action, 'reSelect');

      result = gameState.acceptResponseSelection(selectorId, firstResponse);
      assert.isNotOk('success' in result);
      assert.isOk(isErr(result));
    });
  }); */
});
