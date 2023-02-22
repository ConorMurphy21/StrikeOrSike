const assert = require('chai').assert;
const {GameState} = require('../../models/gameState');

describe('Selection Accepting tests', () => {

    const selectorId = 'selector';
    const matcherId = 'matcher';
    const selectorIndex = 0;
    const matcherIndex = 1;
    let gameState;
    const firstResponse = 'firstResponse';

    beforeEach(() => {
        const players = [{id: selectorId, active: true}, {id: matcherId, active: true}];
        gameState = new GameState({players});
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
            assert.isOk(result.success);
            assert.isNotOk(result.error);
        });

        it('PromptSelection Accept NotSelector', () => {
            gameState.players[matcherIndex].responses.push(firstResponse);
            const result = gameState.acceptResponseSelection(matcherId, firstResponse);
            assert.isNotOk(result.success);
            assert.isOk(result.error);
        });

        it('PromptSelection Accept used', () => {
            gameState.players[selectorIndex].used.push(firstResponse);
            const result = gameState.acceptResponseSelection(selectorId, firstResponse);
            assert.isNotOk(result.success);
            assert.isOk(result.error);
        });

        it('Match Accept Happy', () => {
            const synonym = '#1Response';
            gameState.players[matcherIndex].responses.push(synonym);
            gameState.acceptResponseSelection(selectorId, firstResponse);
            const result = gameState.acceptMatch(matcherId, synonym);
            assert.isOk(result.success);
            assert.isNotOk(result.error);
        });

        it('Match Accept DuplicateRequest', () => {
            const synonym = '#1Response';
            gameState.players[matcherIndex].responses.push(synonym);
            gameState.acceptResponseSelection(selectorId, firstResponse);
            gameState.acceptMatch(matcherId, synonym);
            const result = gameState.acceptMatch(matcherId, synonym);
            assert.isOk(result.success);
        });

        it('Match Accept new match', () => {
            const synonym = '#1Response';
            const synonym2 = '#2Response';
            gameState.players[matcherIndex].responses.push(synonym);
            gameState.players[matcherIndex].responses.push(synonym2);
            gameState.acceptResponseSelection(selectorId, firstResponse);
            gameState.acceptMatch(matcherId, synonym);
            const result = gameState.acceptMatch(matcherId, synonym2);
            assert.isOk(result.success);
            assert.strictEqual(gameState.players[matcherIndex].match, synonym2);
        });

        it('Match Accept used', () => {
            const synonym = '#1Response';
            gameState.players[matcherIndex].responses.push(synonym);
            gameState.players[matcherIndex].used.push(synonym);
            gameState.acceptResponseSelection(selectorId, firstResponse);
            const result = gameState.acceptMatch(matcherId, synonym);
            assert.isNotOk(result.success);
            assert.isOk(result.error);
        });
    });

    describe('choice selectionType', () => {
        beforeEach(() => {
            gameState.selectionType = 'choice';
            gameState.selectionTypeChoice = true;
        });

        it('Accept Happy', () => {
            let result = gameState.acceptSelectionType(selectorId, true);
            assert.isOk(result.success);
            assert.isNotOk(result.error);
            assert.strictEqual(gameState.selectionType, 'strike');
            result = gameState.acceptResponseSelection(selectorId, firstResponse);
            assert.isOk(result.success);
            assert.isNotOk(result.error);
            assert.strictEqual(gameState.selectionType, 'strike');
        });

        it('Error No Choice', () => {
            const result = gameState.acceptResponseSelection(selectorId, firstResponse);
            assert.isNotOk(result.success);
            assert.isOk(result.error);
        });

        it('Accept double choice', () => {
            let result = gameState.acceptSelectionType(selectorId, false);
            assert.isOk(result.success);
            assert.isNotOk(result.error);
            assert.strictEqual(gameState.selectionType, 'sike');
            result = gameState.acceptSelectionType(selectorId, true);
            assert.isOk(result.success);
            assert.isNotOk(result.error);
            assert.strictEqual(gameState.selectionType, 'strike');
            result = gameState.acceptResponseSelection(selectorId, firstResponse);
            assert.isOk(result.success);
            assert.isNotOk(result.error);
            assert.strictEqual(gameState.selectionType, 'strike');
        });

        it('Not selecting', () => {
            const result = gameState.acceptSelectionType(matcherId, true);
            assert.isNotOk(result.success);
            assert.isOk(result.error);
        });

        it('Not choosing acceptSelectionType', () => {
            gameState.selectionTypeChoice = false;
            gameState.selectionType = 'strike';
            const result = gameState.acceptSelectionType(selectorId, true);
            assert.isNotOk(result.success);
            assert.isOk(result.error);
        });
    });
});