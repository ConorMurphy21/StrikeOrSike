import {assert} from "chai";
import {getters} from "../../src/store/modules/game.js";

describe("game getters test", () => {

    const len = 8;
    const selfId = '0';
    const response = 'response';

    let state, rootState, rootGetters, players, matches;

    beforeEach(() => {
        rootGetters = {};
        rootGetters['room/self'] = {id: selfId};

        players = [];
        for (let i = 0; i < len; i++) {
            players[i] = {id: i.toString(), active: true};
        }
        rootState = {room: {players}};
        matches = [];
        players.forEach(player => {
           matches.push({
               player,
               response
           })
        });
        state = {
            selector: {id: selfId},
            matches
        };
    });

    it("CanEndRound Happy", () => {
        matches.splice(0,1);
        const result = getters.canEndRound(state, null, rootState, rootGetters);
        assert.isTrue(result);
    });

    it("CanEndRound Inactive Players", () => {
        matches.splice(0,1);
        for(let i = 4; i < len; i++){
            players[i].active = false;
        }
        matches.splice(4);
        const result = getters.canEndRound(state, null, rootState, rootGetters);
        assert.isTrue(result);
    });

    it("CantEndRound notSelector", () => {
        state.selector.id = '3';
        const result = getters.canEndRound(state, null, rootState, rootGetters);
        assert.isFalse(result);
    });

    it("CantEndRound active missing match", () => {
        matches.splice(len-1);
        const result = getters.canEndRound(state, null, rootState, rootGetters);
        assert.isFalse(result);
    });
});