import { assert } from 'chai';
import { GameState } from '../../src/state/gameState';
import type { Room } from '../../src/state/rooms';
import { isErr, isSuccess } from ':common/result';
import type { Player } from ':common/stateTypes';

describe('Selection Accepting tests', () => {
  const selectorId = 'selector';
  const matcherId = 'matcher';
  const selectorIndex = 0;
  const matcherIndex = 1;
  let gameState: GameState;
  const firstResponse = 'firstResponse';

  beforeEach(() => {
    const players: Player[] = [
      { id: selectorId, name: selectorId, leader: true, active: true },
      { id: matcherId, name: matcherId, leader: false, active: true }
    ];
    const room: Room = {
      name: 'test',
      lastActivity: 0,
      players,
      lang: 'en-CA',
      state: null
    };
    gameState = new GameState(room);
    gameState.players[selectorIndex].responses.push(firstResponse);
    gameState.beginSelection();
  });

  describe('Strike selectionType', () => {
    beforeEach(() => {
      gameState.selectionType = 'strike';
      gameState.selectionTypeChoice = false;
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

    it('Match Accept Happy', () => {
      const synonym = '#1Response';
      gameState.players[matcherIndex].responses.push(synonym);
      gameState.acceptResponseSelection(selectorId, firstResponse);
      const result = gameState.acceptMatch(matcherId, synonym);
      assert.isOk(isSuccess(result));
    });

    it('Match Accept DuplicateRequest', () => {
      const synonym = '#1Response';
      gameState.players[matcherIndex].responses.push(synonym);
      gameState.acceptResponseSelection(selectorId, firstResponse);
      gameState.acceptMatch(matcherId, synonym);
      const result = gameState.acceptMatch(matcherId, synonym);
      assert.isOk(isSuccess(result));
    });

    it('Match Accept new match', () => {
      const synonym = '#1Response';
      const synonym2 = '#2Response';
      gameState.players[matcherIndex].responses.push(synonym);
      gameState.players[matcherIndex].responses.push(synonym2);
      gameState.acceptResponseSelection(selectorId, firstResponse);
      gameState.acceptMatch(matcherId, synonym);
      const result = gameState.acceptMatch(matcherId, synonym2);
      assert.isOk(isSuccess(result));
      assert.strictEqual(gameState.players[matcherIndex].match, synonym2);
    });

    it('Match Accept used', () => {
      const synonym = '#1Response';
      gameState.players[matcherIndex].responses.push(synonym);
      gameState.players[matcherIndex].used.push(synonym);
      gameState.acceptResponseSelection(selectorId, firstResponse);
      const result = gameState.acceptMatch(matcherId, synonym);
      assert.isOk(isErr(result));
    });
  });

  describe('choice selectionType', () => {
    beforeEach(() => {
      gameState.selectionType = 'choice';
      gameState.selectionTypeChoice = true;
    });

    it('Accept Happy', () => {
      let result = gameState.acceptSelectionType(selectorId, true);
      assert.isOk(isSuccess(result));
      assert.strictEqual(gameState.selectionType, 'strike');
      result = gameState.acceptResponseSelection(selectorId, firstResponse);
      assert.isOk(isSuccess(result));
      assert.strictEqual(gameState.selectionType, 'strike');
    });

    it('Error No Choice', () => {
      const result = gameState.acceptResponseSelection(selectorId, firstResponse);
      assert.isOk(isErr(result));
    });

    it('Accept double choice', () => {
      let result = gameState.acceptSelectionType(selectorId, false);
      assert.isOk(isSuccess(result));
      assert.strictEqual(gameState.selectionType, 'sike');
      result = gameState.acceptSelectionType(selectorId, true);
      assert.isOk(isSuccess(result));
      assert.strictEqual(gameState.selectionType, 'strike');
      result = gameState.acceptResponseSelection(selectorId, firstResponse);
      assert.isOk(isSuccess(result));
      assert.strictEqual(gameState.selectionType, 'strike');
    });

    it('Not selecting', () => {
      const result = gameState.acceptSelectionType(matcherId, true);
      assert.isOk(isErr(result));
    });

    it('Not choosing acceptSelectionType', () => {
      gameState.selectionTypeChoice = false;
      gameState.selectionType = 'strike';
      const result = gameState.acceptSelectionType(selectorId, true);
      assert.isOk(isErr(result));
    });
  });
});
