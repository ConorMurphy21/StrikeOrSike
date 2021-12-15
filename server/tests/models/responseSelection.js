const assert = require("chai").assert;
const GameState = require("../../models/gameState");

describe("GameState responseSelection tests", () => {
    let gameState, players;
    beforeEach(() => {
        players = [{id: '1', active: true}, {id: '2', active: true}];
        const room = { players };
        gameState = new GameState(room);
    });

    it("Selection Rotation", () => {
        const len = 8;
        const players = [];
        for(let i = 0; i < len; i++){
            players[i] = {id: i.toString(), active: true};
        }
        const room = { players };
        const gameState = new GameState(room);
        for(let i = 0; i < len; i++){
            gameState.beginSelection(room);
            assert.strictEqual(gameState.initialSelector, i);
            assert.strictEqual(gameState.selector, i);
            for(let j = 0; j < len-1; j++){
                const jj = (j + i + 1) % len;

                assert.strictEqual(gameState.nextSelection(room), true);
                assert.strictEqual(gameState.initialSelector, i);
                assert.strictEqual(gameState.selector, jj);
            }
            assert.strictEqual(gameState.nextSelection(room), false);
            assert.strictEqual(gameState.initialSelector, (i+1) % len);
            assert.strictEqual(gameState.selector, (i - 1 + len) % len);
        }
    });

    it("Selection Rotation with disconnects", () => {
        const len = 8;
        const players = [];
        for(let i = 0; i < len; i++){
            players[i] = {id: i.toString(), active: true};
        }
        const room = { players };
        const gameState = new GameState(room);

        for(let i = 1; i < len; i+=2){
            players[i].active = false;
        }

        for(let i = 0; i < len; i+=2){
            gameState.beginSelection(room);
            assert.strictEqual(gameState.initialSelector, i);
            assert.strictEqual(gameState.selector, i);
            for(let j = 0; j < len-2; j += 2){
                const jj = (j + i + 2) % len;
                assert.strictEqual(gameState.nextSelection(room), true);
                assert.strictEqual(gameState.initialSelector, i);
                assert.strictEqual(gameState.selector, jj);
            }
            assert.strictEqual(gameState.nextSelection(room), false);
            assert.strictEqual(gameState.initialSelector, (i+1) % len);
        }
    });

    it("Selection Rotation with kickedPlayers", () => {
        const len = 8;
        let players = [];
        for(let i = 0; i < len; i++){
            players[i] = {id: i.toString(), active: true};
        }
        let room = { players };
        const gameState = new GameState(room);

        players = players.filter((player) => parseInt(player.id) % 2 === 0);
        room = { players };

        for(let i = 0; i < len; i+=2){
            gameState.beginSelection(room);
            assert.strictEqual(gameState.initialSelector, i);
            assert.strictEqual(gameState.selector, i);
            for(let j = 0; j < len-2; j += 2){
                const jj = (j + i + 2) % len;
                assert.strictEqual(gameState.nextSelection(room), true);
                assert.strictEqual(gameState.initialSelector, i);
                assert.strictEqual(gameState.selector, jj);
            }
            assert.strictEqual(gameState.nextSelection(room), false);
            assert.strictEqual(gameState.initialSelector, (i+1) % len);
        }
    });
});