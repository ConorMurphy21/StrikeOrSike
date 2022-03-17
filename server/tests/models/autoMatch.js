const assert = require('chai').assert;
const {GameState} = require('../../models/gameState');

describe('Automatch tests', () => {
    const selectorId = 'selector';
    const matcherId = 'matcher';
    const selectorIndex = 0;
    const matcherIndex = 1;
    let gameState;
    const firstResponse = 'firstResponse';

    beforeEach((done) => {
        const players = [{id: selectorId, active: true}, {id: matcherId, active: true}];
        gameState = new GameState({players, lang: 'en-CA'});
        gameState.beginNewPrompt().then(() => {
            gameState.acceptPromptResponse(selectorId, firstResponse);
            done();
        });

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
            gameState.players[matcherIndex].responses = [firstResponse + '!!!'];
            gameState.acceptResponseSelection(selectorId, firstResponse);
            assert.isTrue(gameState.players[matcherIndex].matchingComplete);
            assert.strictEqual(gameState.players[matcherIndex].match, firstResponse + '!!!');
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

    async function acceptPrompts(selectorResponses, matcherResponses){
        for(resp of selectorResponses){
            gameState.acceptPromptResponse(selectorId, resp);
        }
        for(resp of matcherResponses){
            gameState.acceptPromptResponse(matcherId, resp);
        }
        gameState.beginSelection();
        gameState.selectionType = 'strike';
        // to make sure prompt response correction is done
        await new Promise(r => setTimeout(r, 100));
    }

});

