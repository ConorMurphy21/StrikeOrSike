import {assert} from "chai";
import {GameState} from "../../src/models/gameState";
import {Player, Room} from "../../src/models/rooms";

describe('Automatch tests', () => {
    const selectorId = 'selector';
    const matcherId = 'matcher';
    const selectorIndex = 0;
    const matcherIndex = 1;
    let gameState: GameState;
    const firstResponse = 'firstResponse';

    beforeEach(() => {
        const players: Player[] = [
            {id: selectorId, name: selectorId, leader: true, active: true},
            {id: matcherId, name: matcherId, leader: false, active: true}];
        const room: Room = {name: 'test', lastActivity: 0, players, lang: 'en-CA', state: null};
        gameState = new GameState(room);
        gameState.beginNewPrompt();
        gameState.acceptPromptResponse(selectorId, firstResponse);
    });

    describe('no misspell', () => {

        beforeEach(() => {
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
            gameState.players[matcherIndex].responses = [firstResponse + '!'];
            gameState.acceptResponseSelection(selectorId, firstResponse);
            assert.isTrue(gameState.players[matcherIndex].matchingComplete);
            assert.strictEqual(gameState.players[matcherIndex].match, firstResponse + '!');
        });

    })

    it('misspelled matcher', (done) => {
        const selectorResponse = 'response';
        const matcherResponse = 'rsponse';
        acceptPrompts([selectorResponse], [matcherResponse]).then(() => {
            gameState.acceptResponseSelection(selectorId, selectorResponse);
            assert.isTrue(gameState.players[matcherIndex].matchingComplete);
            assert.strictEqual(gameState.players[matcherIndex].match, matcherResponse);
            done();
        });
    });

    it('misspelled selector', (done) => {
        const selectorResponse = 'rsponse';
        const matcherResponse = 'response';
        acceptPrompts([selectorResponse], [matcherResponse]).then(() => {
            gameState.acceptResponseSelection(selectorId, selectorResponse);
            assert.isTrue(gameState.players[matcherIndex].matchingComplete);
            assert.strictEqual(gameState.players[matcherIndex].match, matcherResponse);
            done();
        });
    });

    it('misspelled both', (done) => {
        const selectorResponse = 'rsponse';
        const matcherResponse = 'respanse';
        acceptPrompts([selectorResponse], [matcherResponse]).then(() => {
            gameState.acceptResponseSelection(selectorId, selectorResponse);
            assert.isTrue(gameState.players[matcherIndex].matchingComplete);
            assert.strictEqual(gameState.players[matcherIndex].match, matcherResponse);
            done();
        });
    });

    it('misspelled false positive', (done) => {
        const selectorResponse = 'clothes';
        const matcherResponse = 'weedwacker';
        acceptPrompts([selectorResponse], [matcherResponse]).then(() => {
            gameState.acceptResponseSelection(selectorId, selectorResponse);
            assert.isFalse(gameState.players[matcherIndex].matchingComplete);
            assert.strictEqual(gameState.players[matcherIndex].match, '');
            done();
        });
    });

    it('misspelled both + capitalization', (done) => {
        const selectorResponse = 'rsponse';
        const matcherResponse = 'Respanse';
        acceptPrompts([selectorResponse], [matcherResponse]).then(() => {
            gameState.acceptResponseSelection(selectorId, selectorResponse);
            assert.isTrue(gameState.players[matcherIndex].matchingComplete);
            assert.strictEqual(gameState.players[matcherIndex].match, matcherResponse);
            done();
        });
    });

    it('misspelled selector + capitalization', (done) => {
        const selectorResponse = 'rsponse';
        const matcherResponse = 'Response';
        acceptPrompts([selectorResponse], [matcherResponse]).then(() => {
            gameState.acceptResponseSelection(selectorId, selectorResponse);
            assert.isTrue(gameState.players[matcherIndex].matchingComplete);
            assert.strictEqual(gameState.players[matcherIndex].match, matcherResponse);
            done();
        });
    });

    it('pluralization', (done) => {
        const selectorResponse = 'knife';
        const matcherResponse = 'knives';
        acceptPrompts([selectorResponse], [matcherResponse]).then(() => {
            gameState.acceptResponseSelection(selectorId, selectorResponse);
            assert.isTrue(gameState.players[matcherIndex].matchingComplete);
            assert.strictEqual(gameState.players[matcherIndex].match, matcherResponse);
            done();
        });
    });

    it('pluralization + capitalization', (done) => {
        const selectorResponse = 'PeoPle!';
        const matcherResponse = 'person';
        acceptPrompts([selectorResponse], [matcherResponse]).then(() => {
            gameState.acceptResponseSelection(selectorId, selectorResponse);
            assert.isTrue(gameState.players[matcherIndex].matchingComplete);
            assert.strictEqual(gameState.players[matcherIndex].match, matcherResponse);
            done();
        });
    });

    async function acceptPrompts(selectorResponses: string[], matcherResponses: string[]){
        for(const resp of selectorResponses){
            gameState!.acceptPromptResponse(selectorId, resp);
        }
        for(const resp of matcherResponses){
            gameState!.acceptPromptResponse(matcherId, resp);
        }
        gameState!.beginSelection();
        gameState!.selectionType = 'strike';
        // to make sure prompt response correction is done
        await new Promise(r => setTimeout(r, 100));
    }

});

