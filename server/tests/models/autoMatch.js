const assert = require('chai').assert;
const {GameState} = require('../../models/gameState');

describe('Automatch tests', () => {
    const selectorId = 'selector';
    const matcherId = 'matcher';
    const selectorIndex = 0;
    const matcherIndex = 1;
    let gameState;
    const firstResponse = 'firstResponse';

    beforeEach(() => {
        const players = [{id: selectorId, active: true}, {id: matcherId, active: true}];
        gameState = new GameState({players, lang: 'en'});
        gameState.players[selectorIndex].responses.push(firstResponse);
        gameState.beginSelection();
        gameState.selectionType = 'strike';
    });

    it('match empty responses', () => {
        gameState.acceptResponseSelection(selectorId, firstResponse);
        assert.isTrue(gameState.players[matcherIndex].matchingComplete);
        assert.strictEqual(gameState.players[matcherIndex].match, '');
    });

    it('match all used', () => {
        gameState.players[matcherIndex].responses = [firstResponse, 'abc', 'cde'];
        gameState.players[matcherIndex].used = ['cde', 'abc', firstResponse];
        gameState.acceptResponseSelection(selectorId, firstResponse);
        assert.isTrue(gameState.players[matcherIndex].matchingComplete);
        assert.strictEqual(gameState.players[matcherIndex].match, '');
    });

    it('exactMatch', () => {
        gameState.players[matcherIndex].responses = [firstResponse];
        gameState.acceptResponseSelection(selectorId, firstResponse);
        assert.isTrue(gameState.players[matcherIndex].matchingComplete);
        assert.strictEqual(gameState.players[matcherIndex].match, firstResponse);
    });

    it('whiteSpace', () => {
        gameState.players[matcherIndex].responses = [firstResponse + ' '];
        gameState.acceptResponseSelection(selectorId, firstResponse);
        assert.isTrue(gameState.players[matcherIndex].matchingComplete);
        assert.strictEqual(gameState.players[matcherIndex].match, firstResponse + ' ');
    });

    it('capitalization', () => {
        gameState.players[matcherIndex].responses = [firstResponse.toUpperCase()];
        gameState.acceptResponseSelection(selectorId, firstResponse);
        assert.isTrue(gameState.players[matcherIndex].matchingComplete);
        assert.strictEqual(gameState.players[matcherIndex].match, firstResponse.toUpperCase());
    });

    it('punctuation', () => {
        gameState.players[matcherIndex].responses = [firstResponse + '!!!'];
        gameState.acceptResponseSelection(selectorId, firstResponse);
        assert.isTrue(gameState.players[matcherIndex].matchingComplete);
        assert.strictEqual(gameState.players[matcherIndex].match, firstResponse + '!!!');
    });

    it('misspelled matcher', () => {
        const selectorResponse = 'response';
        const matcherResponse = 'rsponse';
        gameState.players[selectorIndex].responses = [selectorResponse];
        gameState.players[matcherIndex].responses = [matcherResponse];
        gameState.acceptResponseSelection(selectorId, selectorResponse);
        assert.isTrue(gameState.players[matcherIndex].matchingComplete);
        assert.strictEqual(gameState.players[matcherIndex].match, matcherResponse);
    });

    it('misspelled selector', () => {
        const selectorResponse = 'rsponse';
        const matcherResponse = 'response';
        gameState.players[selectorIndex].responses = [selectorResponse];
        gameState.players[matcherIndex].responses = [matcherResponse];
        gameState.acceptResponseSelection(selectorId, selectorResponse);
        assert.isTrue(gameState.players[matcherIndex].matchingComplete);
        assert.strictEqual(gameState.players[matcherIndex].match, matcherResponse);
    });

    it('misspelled both', () => {
        const selectorResponse = 'rsponse';
        const matcherResponse = 'respanse';
        gameState.players[selectorIndex].responses = [selectorResponse];
        gameState.players[matcherIndex].responses = [matcherResponse];
        gameState.acceptResponseSelection(selectorId, selectorResponse);
        assert.isTrue(gameState.players[matcherIndex].matchingComplete);
        assert.strictEqual(gameState.players[matcherIndex].match, matcherResponse);
    });

    it('misspelled false positive', () => {
        const selectorResponse = 'clothes';
        const matcherResponse = 'weedwacker';
        gameState.players[selectorIndex].responses = [selectorResponse];
        gameState.players[matcherIndex].responses = [matcherResponse];
        gameState.acceptResponseSelection(selectorId, selectorResponse);
        assert.isFalse(gameState.players[matcherIndex].matchingComplete);
        assert.strictEqual(gameState.players[matcherIndex].match, '');
    });

    it('misspelled both + capitalization', () => {
        const selectorResponse = 'rsponse';
        const matcherResponse = 'Respanse';
        gameState.players[selectorIndex].responses = [selectorResponse];
        gameState.players[matcherIndex].responses = [matcherResponse];
        gameState.acceptResponseSelection(selectorId, selectorResponse);
        assert.isTrue(gameState.players[matcherIndex].matchingComplete);
        assert.strictEqual(gameState.players[matcherIndex].match, matcherResponse);
    });

    it('misspelled selector + capitalization', () => {
        const selectorResponse = 'rsponse';
        const matcherResponse = 'Response';
        gameState.players[selectorIndex].responses = [selectorResponse];
        gameState.players[matcherIndex].responses = [matcherResponse];
        gameState.acceptResponseSelection(selectorId, selectorResponse);
        assert.isTrue(gameState.players[matcherIndex].matchingComplete);
        assert.strictEqual(gameState.players[matcherIndex].match, matcherResponse);
    });

});