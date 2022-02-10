const assert = require('chai').assert;
const {GameState} = require('../../models/gameState');

describe('voteSkipPrompt tests', () => {

    // must be even
    const evenLen = 8;
    const players = [];
    let gameState;

    beforeEach(() => {
        for (let i = 0; i < evenLen; i++) {
            players[i] = {id: i.toString(), active: true};
        }
        gameState = new GameState({players});
        gameState.options.promptSkipping = true;
    });

    it('VoteSkip Happy', (done) => {
        let result;
        let i;
        gameState.registerPromptSkippedCb(done);
        gameState.beginNewPrompt().then(() => {
            for(i = 0; i < Math.ceil(evenLen/2)-1; i++){
                result = gameState.pollVote(i.toString(), 'skipPrompt');
                assert.isOk(result.success);
                assert.strictEqual(result.count, i + 1);
            }
            result = gameState.pollVote(i.toString(), 'skipPrompt');
            assert.isOk(result.success);
            assert.strictEqual(result.count, i + 1);
        });
    });

    it('VoteSkip unvote', (done) => {
        let result;
        let i;
        gameState.registerPromptSkippedCb(done);
        gameState.beginNewPrompt().then(() => {
            for (i = 0; i < Math.ceil(evenLen / 2) - 1; i++) {
                result = gameState.pollVote(i.toString(), 'skipPrompt');
                assert.isOk(result.success);
                assert.strictEqual(result.count, i + 1);
            }
            result = gameState.pollVote(i.toString(), 'skipPrompt');
            assert.isOk(result.success);
            assert.strictEqual(result.count, i - 1);
            result = gameState.pollVote(i.toString(), 'skipPrompt');
            assert.isOk(result.success);
            assert.strictEqual(result.count, i);
        });
    });

});
