const {GameState} = require('../../models/gameState');
const {assert} = require('chai');
const {disconnectPlayer} = require('../../models/rooms');

describe('Complete callback tests', () => {
    let players;
    const selectorId = 'selector';
    const matcherId = 'matcher';
    const matcher2Id = 'matcher2';
    const selectorIndex = 0;
    const matcherIndex = 1;
    const matcher2Index = 2;
    let gameState;
    const firstResponse = 'firstResponse';
    const differentResponse = 'differentResponse';

    beforeEach(() => {
        players = [{id: selectorId, active: true}, {id: matcherId, active: true}, {id: matcher2Id, active: true}];
        gameState = new GameState({players});
        gameState.options.sikeDispute = true;
        gameState.options.sikeRetries = 0;
    });

    describe('Prompt Skip Vote', () => {

       it('Disconnect non-voter', (done) => {
           gameState.options.promptSkipping = true;
           gameState.registerPromptSkippedCb(done);
           gameState.beginNewPrompt().then(() => {
               gameState.pollVote(selectorId, 'skipPrompt');
               players[matcherIndex].active = false;
               gameState.disconnect(matcherId);
           });
       });
    });

    describe('Selection/Matching', () => {

        beforeEach(() => {
            gameState.players[selectorIndex].responses.push(firstResponse);
            gameState.players[matcherIndex].responses.push(differentResponse);
            gameState.beginSelection();
            gameState.selectionType = 'strike';
        });

        it('Selector Disconnects while selecting', (done) => {
            gameState.registerSelectionUnsuccessfulCb(done);
            gameState.disconnect(selectorId);
        });

        it('Last Matcher disconnects', (done) => {
            gameState.registerMatchingCompleteCb((selectorActive) => {
                assert.isTrue(selectorActive);
                done();
            });
            gameState.acceptResponseSelection(selectorId, firstResponse);
            gameState.disconnect(matcherId);
        });

        it('Last Matcher matches', (done) => {
            gameState.registerMatchingCompleteCb((selectorActive) => {
                assert.isTrue(selectorActive);
                done();
            });
            gameState.acceptResponseSelection(selectorId, firstResponse);
            gameState.acceptMatch(matcherId, '');
        });

        it('Last Matcher disconnect selector disconnected', (done) => {
            gameState.registerMatchingCompleteCb((selectorActive) => {
                assert.isFalse(selectorActive);
                done();
            });
            gameState.registerSelectionUnsuccessfulCb(() => assert.fail());
            gameState.acceptResponseSelection(selectorId, firstResponse);
            players[selectorIndex].active = false;
            gameState.disconnect(matcherId);
        });

        it('Last Matcher matches selector disconnected', (done) => {
            gameState.registerMatchingCompleteCb((selectorActive) => {
                assert.isFalse(selectorActive);
                done();
            });
            gameState.registerSelectionUnsuccessfulCb(() => assert.fail());
            gameState.acceptResponseSelection(selectorId, firstResponse);
            players[selectorIndex].active = false;
            gameState.acceptMatch(matcherId, '');
        });
    });


    describe('sikeDispute', () => {
        beforeEach(() => {
            gameState.players[selectorIndex].responses.push(firstResponse);
            gameState.players[matcherIndex].responses.push(differentResponse);
            gameState.options.sikeDispute = true;
            gameState.beginSelection();
            gameState.selectionType = 'sike';
            gameState.acceptResponseSelection(selectorId, firstResponse);
        });

        it('last voter disconnect', (done) => {
            gameState.registerDisputeCompleteCb((action) => {
                assert.strictEqual(action, 'nextSelection');
                done();
            });
            gameState.acceptSikeDisputeVote(matcherId, false);
            players[matcher2Index].active = false;
            gameState.disconnect(matcher2Id);
        });

    });
});