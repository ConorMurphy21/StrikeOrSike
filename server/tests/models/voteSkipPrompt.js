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
        gameState.beginNewPrompt();
    });

    it('VoteSkip Happy', () => {
        let result;
        let i;
        for(i = 0; i < Math.ceil(evenLen/2)-1; i++){
            result = gameState.voteSkipPrompt(i.toString(), true);
            assert.isOk(result.success);
            assert.strictEqual(result.count, i + 1);
            assert.isFalse(result.skip);
        }
        result = gameState.voteSkipPrompt(i.toString(), true);
        assert.isOk(result.success);
        assert.strictEqual(result.count, i + 1);
        assert.isTrue(result.skip);
    });

    it('VoteSkip unvote', () => {
        let result;
        let i;
        for(i = 0; i < Math.ceil(evenLen/2)-1; i++){
            result = gameState.voteSkipPrompt(i.toString(), true);
            assert.isOk(result.success);
            assert.strictEqual(result.count, i + 1);
            assert.isFalse(result.skip);
        }
        result = gameState.voteSkipPrompt((i-1).toString(), false);
        assert.isOk(result.success);
        assert.strictEqual(result.count, i-1);
        assert.isFalse(result.skip);
        result = gameState.voteSkipPrompt(i.toString(), true);
        assert.isOk(result.success);
        assert.strictEqual(result.count, i );
        assert.isFalse(result.skip);
    });

});
