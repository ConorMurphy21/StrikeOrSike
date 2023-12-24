import {Player, Room} from "../../src/models/rooms";
import {GameState} from "../../src/models/gameState";
import {assert} from "chai";

describe('Selection Rotation tests', () => {
    let players: Player[];
    let room: Room;
    let gameState: GameState;
    let len: number;

    beforeEach(() => {
        const len = 8;
        players = [];
        for (let i = 0; i < len; i++) {
            players[i] = {id: i.toString(), name: i.toString(), leader: false, active: true};
        }
        players[0].leader = true;
        room = {name: 'test', lastActivity: 0, players, lang: 'en-CA', state: null};
        gameState = new GameState(room);
        for (const player of gameState.players) {
            player.responses.push('response');
        }
    });

    it('Selection Rotation', () => {

        for(let i = 0; i < len; i++){
            gameState.beginSelection();
            assert.strictEqual(gameState.initialSelector, i);
            assert.strictEqual(gameState.selector, i);
            for(let j = 0; j < len-1; j++){
                const jj = (j + i + 1) % len;

                assert.strictEqual(gameState.nextSelection(), true);
                assert.strictEqual(gameState.initialSelector, i);
                assert.strictEqual(gameState.selector, jj);
            }
            assert.strictEqual(gameState.nextSelection(), false);
            assert.strictEqual(gameState.initialSelector, (i+1) % len);
            assert.strictEqual(gameState.selector, (i - 1 + len) % len);
        }
    });

    it('Selection Rotation with disconnects', () => {
        for(let i = 1; i < len; i+=2){
            players[i].active = false;
        }
        assertSelectsEvens();
    });

    it('Selection Rotation with emptyResponses', () => {
        for(let i = 1; i < len; i+=2){
            gameState.players[i].responses = [];
        }
        assertSelectsEvens();
    });

    it('Selection Rotation with all used responses', () => {
        for(let i = 1; i < len; i+=2){
            gameState.players[i].responses = ['r1', 'r2', 'r3'];
            gameState.players[i].used = ['r1', 'r2', 'r3'];
        }
        assertSelectsEvens();
    });

    it('Selection Rotation with kickedPlayers', () => {
        players = players.filter((player) => parseInt(player.id) % 2 === 0);
        assertSelectsEvens();
    });

    function assertSelectsEvens(){
        for(let i = 0; i < len; i+=2){
            gameState.beginSelection();
            assert.strictEqual(gameState.initialSelector, i);
            assert.strictEqual(gameState.selector, i);
            for(let j = 0; j < len-2; j += 2){
                const jj = (j + i + 2) % len;
                assert.strictEqual(gameState.nextSelection(), true);
                assert.strictEqual(gameState.initialSelector, i);
                assert.strictEqual(gameState.selector, jj);
            }
            assert.strictEqual(gameState.nextSelection(), false);
            assert.strictEqual(gameState.initialSelector, (i+1) % len);
        }
    }
});

