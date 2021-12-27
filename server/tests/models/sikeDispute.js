const assert = require("chai").assert;
const {GameState} = require("../../models/gameState");

describe("Sike Dispute tests", () => {

    const selectorId = '0';
    const matcherId = '1';
    const selectorIndex = 0;
    const matcherIndex = 1;
    let gameState;
    const firstResponse = 'firstResponse';
    const secondResponse = 'secondResponse';
    // must be even
    const evenLen = 8;
    const players = [];

    beforeEach(() => {
        for (let i = 0; i < evenLen; i++) {
            players[i] = {id: i.toString(), active: true};
        }
        gameState = new GameState({players});
        gameState.options.sikeDispute = true;
        gameState.players[selectorIndex].responses.push(firstResponse);
        gameState.players[selectorIndex].responses.push(secondResponse);
    });

    describe('Strike selectionType', () => {
        beforeEach(() => {
            gameState.beginSelection();
            gameState.selectionType = 'strike';
        });

        it("PromptSelection Accept Happy", () => {
            const result = gameState.acceptResponseSelection(selectorId, firstResponse);
            assert.isOk(result.success);
            assert.isNotOk(result.error);
            assert.strictEqual(result.stage, 'responseMatching');
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
    });

    describe('Sike selectionType', () => {
        beforeEach(() => {
            gameState.options.sikeRetries = 0;
            gameState.beginSelection();
            gameState.selectionType = 'sike';
        });

        it("PromptSelection Accept Happy", () => {
            const result = gameState.acceptResponseSelection(selectorId, firstResponse);
            assert.isOk(result.success);
            assert.isNotOk(result.error);
            assert.strictEqual(result.stage, 'sikeDispute');
        });

        it("Dispute vote in favor", () => {
            gameState.acceptResponseSelection(selectorId, firstResponse);
            for (let i = 1; i < evenLen-1; i++) {
                const result = gameState.acceptSikeDisputeVote(i.toString(), !!(i % 2));
                assert.isOk(result.success);
                assert.strictEqual(result.action, 'noOp');
            }
            const result = gameState.acceptSikeDisputeVote((evenLen-1).toString(), true);
            assert.isOk(result.success);
            assert.strictEqual(result.action, 'beginMatching');
        });

        it("Dispute vote against", () => {
            gameState.acceptResponseSelection(selectorId, firstResponse);
            for (let i = 1; i < evenLen-1; i++) {
                const result = gameState.acceptSikeDisputeVote(i.toString(), !(i % 2));
                assert.isOk(result.success);
                assert.strictEqual(result.action, 'noOp');
            }
            const result = gameState.acceptSikeDisputeVote((evenLen-1).toString(), false);
            assert.isOk(result.success);
            assert.strictEqual(result.action, 'nextSelection');
        });

        it("BadRequest double vote", () => {
            gameState.acceptResponseSelection(selectorId, firstResponse);
            gameState.acceptSikeDisputeVote('2', true);
            const countBefore = gameState.sikeDisputeUpVotes;
            const result = gameState.acceptSikeDisputeVote('2', true);
            assert.isNotOk(result.success);
            assert.isOk(result.error);
            assert.strictEqual(gameState.sikeDisputeUpVotes, countBefore);
        });

        it("BadRequest Self Vote", () => {
            gameState.acceptResponseSelection(selectorId, firstResponse);
            const countBefore = gameState.sikeDisputeUpVotes;
            const result = gameState.acceptSikeDisputeVote('0', true);
            assert.isNotOk(result.success);
            assert.isOk(result.error);
            assert.strictEqual(gameState.sikeDisputeUpVotes, countBefore);
        });

        it("Dispute vote in favor w inactivity", () => {
            gameState.acceptResponseSelection(selectorId, firstResponse);
            for (let i = 1; i < evenLen-1; i++) {
                const result = gameState.acceptSikeDisputeVote(i.toString(), !!(i % 2));
                assert.isOk(result.success);
                assert.strictEqual(result.action, 'noOp');
            }
            const result = gameState.acceptSikeDisputeVote((evenLen-1).toString(), true);
            assert.isOk(result.success);
            assert.strictEqual(result.action, 'beginMatching');
        });

        it("Dispute vote in favor w inactive", () => {
            gameState.acceptResponseSelection(selectorId, firstResponse);
            for (let i = 1; i < evenLen-3; i++) {
                players[i].active = false;
            }
            gameState.acceptSikeDisputeVote((evenLen-2).toString(), true);
            const result = gameState.acceptSikeDisputeVote((evenLen-1).toString(), true);
            assert.isOk(result.success);
            assert.strictEqual(result.action, 'beginMatching');
        });

        it("Dispute vote in favor evenVoters", () => {
            gameState.acceptResponseSelection(selectorId, firstResponse);
            players.splice(evenLen-1, 1);
            const nVoters = evenLen - 2;
            for (let i = 1; i < nVoters/2 + 1; i++) {
                const result = gameState.acceptSikeDisputeVote(i.toString(), false);
                assert.isOk(result.success);
                assert.strictEqual(result.action, 'noOp');
            }
            for (let i = nVoters/2 + 1; i < evenLen-2; i++) {
                const result = gameState.acceptSikeDisputeVote(i.toString(), true);
                assert.isOk(result.success);
                assert.strictEqual(result.action, 'noOp');
            }
            const result = gameState.acceptSikeDisputeVote((evenLen-2).toString(), true);
            assert.isOk(result.success);
            assert.strictEqual(result.action, 'beginMatching');
        });

        it("Dispute vote against evenVoters", () => {
            gameState.acceptResponseSelection(selectorId, firstResponse);
            players.splice(evenLen-1, 1);
            const nVoters = evenLen - 2;
            for (let i = 1; i < nVoters/2; i++) {
                const result = gameState.acceptSikeDisputeVote(i.toString(), true);
                assert.isOk(result.success);
                assert.strictEqual(result.action, 'noOp');
            }
            for (let i = nVoters/2; i < evenLen-2; i++) {
                const result = gameState.acceptSikeDisputeVote(i.toString(), false);
                assert.isOk(result.success);
                assert.strictEqual(result.action, 'noOp');
            }
            const result = gameState.acceptSikeDisputeVote((evenLen-2).toString(), false);
            assert.isOk(result.success);
            assert.strictEqual(result.action, 'nextSelection');
        });



    });
    describe('Sike selectionType w retries', () => {
        beforeEach(() => {
            gameState.options.sikeRetries = 1;
            gameState.beginSelection();
            gameState.selectionType = 'sike';
        });

        it("Dispute vote against with retries happy", () => {
            gameState.acceptResponseSelection(selectorId, firstResponse);
            for (let i = 1; i < evenLen - 1; i++) {
                const result = gameState.acceptSikeDisputeVote(i.toString(), !(i % 2));
                assert.isOk(result.success);
                assert.strictEqual(result.action, 'noOp');
            }
            let result = gameState.acceptSikeDisputeVote((evenLen - 1).toString(), false);
            assert.isOk(result.success);
            assert.strictEqual(result.action, 'reSelect');

            // reselect valid response
            gameState.acceptResponseSelection(selectorId, secondResponse);
            for (let i = 1; i < evenLen - 1; i++) {
                const result = gameState.acceptSikeDisputeVote(i.toString(), !(i % 2));
                assert.isOk(result.success);
                assert.strictEqual(result.action, 'noOp');
            }
            result = gameState.acceptSikeDisputeVote((evenLen - 1).toString(), false);
            assert.isOk(result.success);
            assert.strictEqual(result.action, 'nextSelection');
        });

        it("Dispute vote against with retries inactive selector", () => {
            gameState.acceptResponseSelection(selectorId, firstResponse);
            players[selectorIndex].active = false;
            gameState.disconnect(selectorId);

            for (let i = 1; i < evenLen - 1; i++) {
                const result = gameState.acceptSikeDisputeVote(i.toString(), !(i % 2));
                assert.isOk(result.success);
                assert.strictEqual(result.action, 'noOp');
            }
            let result = gameState.acceptSikeDisputeVote((evenLen - 1).toString(), false);
            assert.isOk(result.success);
            assert.strictEqual(result.action, 'nextSelection');
        });

        it("Dispute vote against with retries reuse selection", () => {
            gameState.acceptResponseSelection(selectorId, firstResponse);
            for (let i = 1; i < evenLen - 1; i++) {
                const result = gameState.acceptSikeDisputeVote(i.toString(), !(i % 2));
                assert.isOk(result.success);
                assert.strictEqual(result.action, 'noOp');
            }
            let result = gameState.acceptSikeDisputeVote((evenLen - 1).toString(), false);
            assert.isOk(result.success);
            assert.strictEqual(result.action, 'reSelect');

            result = gameState.acceptResponseSelection(selectorId, firstResponse);
            assert.isNotOk(result.success);
            assert.isOk(result.error);
        });
    });
});
