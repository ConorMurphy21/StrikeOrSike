import {GameState} from "../../src/models/gameState";
import {assert} from "chai";
import {disconnectPlayer, Player, Room} from "../../src/models/rooms";


describe('Complete callback tests', () => {
    let players: Player[];
    const selectorId = 'selector';
    const matcherId = 'matcher';
    const matcher2Id = 'matcher2';
    const selectorIndex = 0;
    const matcherIndex = 1;
    const matcher2Index = 2;
    let gameState: GameState;
    const firstResponse = 'firstResponse';
    const differentResponse = 'differentResponse';

    beforeEach(() => {
        players = [
            {id: selectorId, name: selectorId, leader: true, active: true},
            {id: matcherId, name: matcherId, leader: false, active: true},
            {id: matcher2Id, name: matcher2Id, leader: false, active: true}];
        const room: Room = {name: 'test', lastActivity: 0, players, lang: 'en-CA', state: null};
        gameState = new GameState(room);
        gameState.options.sikeDispute = true;
        gameState.options.sikeRetries = 0;
    });

    describe('Prompt Skip Vote', () => {

       it('Disconnect non-voter', (done) => {
           gameState.options.promptSkipping = true;
           gameState.room.players.push({id: 'matcher3Id', name: 'matcher3Id', leader: false, active: true})
           gameState.registerPromptSkippedCb(done);
           gameState.beginNewPrompt();
           gameState.pollVote(selectorId, 'skipPrompt');
           gameState.pollVote(matcherId, 'skipPrompt');
           players[matcher2Index].active = false;
           gameState.disconnect(matcherId);
       });
    });

    describe('Selection/Matching', () => {

        beforeEach(() => {
            gameState.players[selectorIndex].responses.push(firstResponse);
            gameState.players[matcherIndex].responses.push(differentResponse);
            gameState.beginSelection();
            gameState.selectionType = 'strike';
        });

        it.skip('Selector Disconnects while selecting', (done) => {
            gameState.registerSelectionUnsuccessfulCb(done);
            gameState.disconnect(selectorId);
        });

        it('Last Matcher disconnects', (done) => {
            gameState.registerMatchingCompleteCb((selectorActive) => {
                assert.isTrue(selectorActive);
                done();
            });
            gameState.acceptResponseSelection(selectorId, firstResponse);
            players[matcherIndex].active = false;
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

        it.skip('Last Matcher disconnect selector disconnected', (done) => {
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
            gameState.pollVote(matcherId, 'sikeDispute');
            players[matcher2Index].active = false;
            gameState.disconnect(matcher2Id);
        });

    });
});