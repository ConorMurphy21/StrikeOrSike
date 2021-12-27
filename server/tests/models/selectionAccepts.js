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
        gameState.players[selectorIndex].responses.push(firstResponse);
        gameState.beginSelection();
    });

    it("PromptSelection Accept Happy", () => {
        const result = gameState.acceptResponseSelection(selectorId, firstResponse);
        assert.isOk(result.success);
        assert.isNotOk(result.error);
    });

    it("PromptSelection Accept NotSelector", () => {
        gameState.players[matcherIndex].responses.push(firstResponse);
        const result = gameState.acceptResponseSelection(matcherId, firstResponse);
        assert.isNotOk(result.success);
        assert.isOk(result.error);
    });

    it("PromptSelection Accept used", () => {
        gameState.players[selectorIndex].used.push(firstResponse);
        const result = gameState.acceptResponseSelection(selectorId, firstResponse);
        assert.isNotOk(result.success);
        assert.isOk(result.error);
    });

    it("Match Accept Happy", () => {
        const synonym = '#1Response';
        gameState.players[matcherIndex].responses.push(synonym);
        gameState.acceptResponseSelection(selectorId, firstResponse);
        const result = gameState.acceptMatch(matcherId, synonym);
        assert.isOk(result.success);
        assert.isNotOk(result.error);
    });

    it("Match Accept DuplicateRequest", () => {
        const synonym = '#1Response';
        gameState.players[matcherIndex].responses.push(synonym);
        gameState.acceptResponseSelection(selectorId, firstResponse);
        gameState.acceptMatch(matcherId, synonym);
        const result = gameState.acceptMatch(matcherId, synonym);
        assert.isNotOk(result.success);
        assert.isOk(result.error);
    });

    it("Match Accept used", () => {
        const synonym = '#1Response';
        gameState.players[matcherIndex].responses.push(synonym);
        gameState.players[matcherIndex].used.push(synonym);
        gameState.acceptResponseSelection(selectorId, firstResponse);
        const result = gameState.acceptMatch(matcherId, synonym);
        assert.isNotOk(result.success);
        assert.isOk(result.error);
    });
});