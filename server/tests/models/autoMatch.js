const assert = require("chai").assert;
const GameState = require("../../models/gameState");

describe("Selection Accepting tests", () => {
    const selectorId = 'selector';
    const matcherId = 'matcher';
    const selectorIndex = 0;
    const matcherIndex = 1;
    let gameState;
    const firstResponse = 'firstResponse';

    beforeEach(() => {
        const players = [{id: selectorId, active: true}, {id: matcherId, active: true}];
        gameState = new GameState({players});
        gameState = new GameState({players}, null);
        gameState.players[selectorIndex].responses.push(firstResponse);
        gameState.beginSelection({players});
    });

    it("AutoMatch match empty responses", () => {
        gameState.acceptResponseSelection(selectorId, firstResponse);
        assert.isTrue(gameState.players[matcherIndex].matchingComplete);
        assert.strictEqual(gameState.players[matcherIndex].match, '');
    });

    it("AutoMatch match all used", () => {
        gameState.players[matcherIndex].responses = [firstResponse, 'abc', 'cde'];
        gameState.players[matcherIndex].used = ['cde', 'abc', firstResponse];
        gameState.acceptResponseSelection(selectorId, firstResponse);
        assert.isTrue(gameState.players[matcherIndex].matchingComplete);
        assert.strictEqual(gameState.players[matcherIndex].match, '');
    });

    it("AutoMatch exactMatch", () => {
        gameState.players[matcherIndex].responses = [firstResponse];
        gameState.acceptResponseSelection(selectorId, firstResponse);
        assert.isTrue(gameState.players[matcherIndex].matchingComplete);
        assert.strictEqual(gameState.players[matcherIndex].match, firstResponse);
    });

    it("AutoMatch whiteSpace");

    it("AutoMatch capitalizationMatch");

    it("AutoMatch punctuationMatch");

    it("AutoMatch misSpelledMatch");

    it("AutoMatch misSpelledSelection");

    it("AutoMatch misSpelledBoth");

});