// noinspection JSUnusedGlobalSymbols

const state = () => ({
    scene: 'lobby',
    prompt: '',
    timer: 0,
    responses: [],
    selectionType: '',
    selector: {},
    selectedResponse: '',
    matches: [],
    usedResponses: []
});

export const getters = {
    roundPoints(state) {
        if (state.selectionType === 'strike') {
            let count = 0;
            state.matches.forEach(match => {
                if (match.response !== '') {
                    count++;
                }
            });
            return count;
        }
        if (state.selectionType === 'sike') {
            let count = 0;
            state.matches.forEach(match => {
                if (match.response === '') {
                    count++;
                }
            });
            return count;
        }
    },
    canEndRound(state, getters, rootState, rootGetters) {
        const self = rootGetters["room/self"].id
        if(state.selector.id !== self) return false;

        let finishedMatching = true;
        rootState.room.players.forEach(player => {
            if (player.active && player.id !== self) {
                const match = state.matches.find(match => match.player.id === player.id);
                if (!match) finishedMatching = false;
            }
        });
        return finishedMatching;
    }
}

const mutations = {
    setScene(state, data) {
        state.scene = data;
    },
    setPrompt(state, data) {
        state.prompt = data;
    },
    setTimer(state, data) {
        state.timer = data;
    },
    clearResponses(state) {
        state.responses = [];
    },
    setSelectionType(state, data) {
        state.selectionType = data;
    },
    setSelector(state, data) {
        state.selector = data;
    },
    setSelectedResponse(state, data) {
        state.selectedResponse = data;
    },
    addMatch(state, data) {
        state.matches.push(data);
    },
    clearMatches(state) {
        state.matches = [];
    }
}

const socketMutations = {
    SOCKET_promptResponse(state, response) {
        state.responses.push(response);
    },
    SOCKET_gameOver(state) {
        state.scene = 'lobby';
    }
}

const socketActions = {
    async SOCKET_beginPrompt({state, commit, dispatch}, data) {
        commit('setPrompt', data.prompt);
        commit('setTimer', data.timer);
        commit('clearResponses');
        commit('setScene', 'promptResponse');
        dispatch('startTimer').then(() => {
            // commit('setScene', 'lobby');
        })
    },
    async SOCKET_nextSelection({state, commit, rootGetters, rootState}, data) {
        const selector = rootState.room.players.find(player => player.id === data.selector);
        commit('clearMatches');
        commit('setSelector', selector);
        commit('setSelectionType', data.selectionType);
        if (selector.id === rootGetters['room/self'].id) {
            commit('setScene', 'activeSelection');
        } else {
            commit('setScene', 'passiveSelection');
        }
    },
    async SOCKET_beginDispute({state, commit, rootGetters}, response) {
        commit('setSelectedResponse', response);
        if(state.selector.id === rootGetters["room/self"].id){
            commit('setScene', 'passiveDispute');
        }else {
            commit('setScene', 'activeDispute');
        }
    },
    async SOCKET_beginMatching({state, commit, rootGetters}, response) {
        commit('setSelectedResponse', response);
        if(state.selector.id === rootGetters["room/self"].id){
            commit('setScene', 'matchingSummary');
        }else {
            commit('setScene', 'activeMatching');
        }
    },
    async SOCKET_matchFound({state, commit, rootState, rootGetters}, match) {
        commit('addMatch', {
            player: rootState.room.players.find(player => player.id === match.player),
            // response === '' if no match was found (i.e. sike)
            response: match.response
        });
        if (match.player === rootGetters['room/self'].id) {
            commit('setScene', 'matchingSummary');
        }
    }
}

const actions = {
    async startTimer({state, commit}) {
        return new Promise(async (resolve) => {
            while (state.timer > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                commit('setTimer', state.timer - 1);
            }
            resolve();
        })
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations: {...socketMutations, ...mutations},
    actions: {...socketActions, ...actions}
}