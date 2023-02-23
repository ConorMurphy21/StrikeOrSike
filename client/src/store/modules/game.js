// noinspection JSUnusedGlobalSymbols

const state = () => ({
    scene: 'lobby',
    prompt: '',
    timer: 0,
    // for cancelling the timer
    timeoutId: null,
    responses: [],
    usedResponses: [],
    strikedResponse: '',
    sikedResponse: '',
    selectionTypeChoice: false,
    selectionType: '',
    selector: {},
    selectedResponse: '',
    matches: [],

    scores: [],
    // optional state
    voteCounts: {
        skipPrompt: {count: 0, next: false},
        startNextRound: {count: 0, next: false},
        sikeDispute: {count: 0, next: false},
    },
    options: {},
    firstSelection: true,
    hasNewPrompt: true
});

export const getters = {
    isSelector(state, getters, rootState, rootGetters) {
        return state.selector.id === rootGetters['room/self'].id;
    },
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
                if (match.response === '' && match.player.active) {
                    count++;
                }
            });
            return count;
        }
    },
    canEndRound(state, getters, rootState, rootGetters) {
        const self = rootGetters['room/self'].id
        if (state.selector.id !== self) return false;

        let finishedMatching = true;
        rootState.room.players.forEach(player => {
            if (player.active && player.id !== self) {
                const match = state.matches.find(match => match.player.id === player.id);
                if (!match) finishedMatching = false;
            }
        });
        return finishedMatching;
    },

    skipVoteCount(state) {
        return state.voteCounts['skipPrompt'].count;
    },
    startNextRoundCount(state) {
        return state.voteCounts['startNextRound'].count;
    },
    sikeDisputeCount(state) {
        return state.voteCounts['sikeDispute'].count;
    },
    skipVoteNext(state) {
        return state.voteCounts['skipPrompt'].next;
    },
    startNextRoundNext(state) {
        return state.voteCounts['startNextRound'].next;
    },
    sikeDisputeNext(state) {
        return state.voteCounts['sikeDispute'].next;
    },
    promptSkipping(state) {
        return state.options.promptSkipping;
    },
    sikeDispute(state) {
        return state.options.sikeDispute;
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
    setTimeoutId(state, data) {
        state.timeoutId = data;
    },
    clearResponses(state) {
        state.responses = [];
        state.usedResponses = [];
        state.sikedResponse = '';
        state.strikedResponse = '';
    },
    setResponses(state, data) {
        state.responses = data;
    },
    setSelectionType(state, data) {
        state.selectionType = data;
    },
    setSelectionTypeChoice(state, isChoice) {
        state.selectionTypeChoice = isChoice;
    },
    setSelector(state, data) {
        state.selector = data;
    },
    setSelectedResponse(state, data) {
        state.selectedResponse = data;
    },
    addMatch(state, data) {
        // only keep 1 match per player
        const match = state.matches.find(match => match.player.id === data.player.id);
        if (match) {
            match.response = data.response;
        } else {
            state.matches.push(data);
        }
    },
    removeMatch(state, data) {
        state.matches = state.matches.filter(match => match.player.id !== data);
    },
    clearMatches(state) {
        state.matches = [];
    },
    useSelectorResponse(state, data) {
        state.usedResponses.push(data);
        if(state.selectionType === 'strike'){
            state.strikedResponse = data;
        } else {
            state.sikedResponse = data;
        }
    },
    useResponse(state, data) {
        state.usedResponses.push(data);
    },

    setUsedResponses(state, data) {
        state.usedResponses = data;
    },
    setScores(state, data) {
        state.scores = data;
    },
    setFirstSelection(state, data){
        state.firstSelection = data;
    },
    setVoteCounts(state, data) {
        state.voteCounts = data;
    },
    setHasNewPrompt(state, data) {
        state.hasNewPrompt = data;
    }
}

const socketMutations = {
    SOCKET_setOptions(state, options) {
        state.options = options;
    },
    SOCKET_promptResponse(state, response) {
        state.responses.push(response);
    },
    SOCKET_selectionTypeChosen(state, selectionType) {
        state.selectionType = selectionType;
    },
    SOCKET_setVoteCount(state, data) {
        state.voteCounts[data.pollName] = {count: data.count, next: data.next};
    },
}

const socketActions = {
    async SOCKET_beginPrompt({state, commit, dispatch}, prompt) {
        commit('setTimer', 3);
        commit('setPrompt', prompt);
        commit('clearResponses');
        commit('SOCKET_setVoteCount', {pollName:'skipPrompt', count: 0});
        commit('setScene', 'countdown');
        commit('setFirstSelection', true);
        dispatch('startTimer').then(() => {
            commit('setTimer', state.options.promptTimer);
            dispatch('startTimer');
            commit('setScene', 'promptResponse');
        });
    },
    async SOCKET_nextSelection({state, commit, rootGetters, rootState}, data) {
        const selector = rootState.room.players.find(player => player.id === data.selector);
        // before we clear matches, make sure we used our match, this can happen if a next selection happens between
        // unmatch and match
        const selfMatch = state.matches.find(match => match.player.id === rootGetters['room/self'].id);
        if(selfMatch && !state.usedResponses.includes(selfMatch.response))
            commit('useResponse', selfMatch.response)

        commit('clearMatches');
        commit('setSelector', selector);
        commit('setSelectionType', data.selectionType);
        commit('SOCKET_setVoteCount', {pollName:'sikeDispute', count: 0});
        if (data.selectionType === 'choice') {
            commit('setSelectionTypeChoice', true);
        } else {
            commit('setSelectionTypeChoice', false);
        }
        commit('setScene', 'selection');
    },
    async SOCKET_beginMatching({state, commit, getters}, response) {
        commit('setFirstSelection', false);
        commit('setSelectedResponse', response);
        if (getters.isSelector) {
            commit('useSelectorResponse', response);
            commit('setScene', 'matchingSummary');
        } else {
            commit('setScene', 'activeMatching');
        }
    },
    async SOCKET_matchesFound({state, commit, rootState, rootGetters}, matches) {
        for(const match of matches) {
            commit('addMatch', {
                player: rootState.room.players.find(player => player.id === match.player),
                response: match.response,
                exact: match.exact
            });
            if (match.player === rootGetters['room/self'].id) {
                commit('useResponse', match.response);
                commit('setScene', 'matchingSummary');
            }
        }
    },
    async SOCKET_endRound({commit}, data) {
      commit('setScene', 'endRound');
      commit('setHasNewPrompt', data.hasNewPrompt);
      commit('SOCKET_setVoteCount', {pollName:'startNextRound', count: 0});
    },
    async SOCKET_gameOver({state, commit, rootState}, data) {
        commit('setScene', 'endGame');
        const scores = [];
        for (const score of data) {
            scores.push({
                player: rootState.room.players.find(player => player.id === score.player),
                points: score.points
            });
        }
        commit('setScores', scores);
    },
    async SOCKET_midgameConnect({state, commit, dispatch, rootState, rootGetters}, data) {
        commit('setSelectionType', data.selectionType);
        if(data.selectionType === 'choice'){
            commit('setSelectionTypeChoice', true);
        }
        commit('SOCKET_setOptions', data.options);
        commit('setResponses', data.responses);
        commit('setUsedResponses', data.usedResponses);
        commit('setSelector', rootState.room.players.find(player => player.id === data.selector));
        commit('setSelectedResponse', data.selectedResponse);
        commit('setPrompt', data.prompt);
        commit('setTimer', data.timer);
        commit('setVoteCounts', data.voteCounts);

        if(data.timer){
            dispatch('startTimer');
        }
        const isSelector = state.selector.id === rootGetters['room/self'].id;
        let scene = '';
        //'lobby', 'response', 'selection', 'matching'
        switch (data.stage) {
            case 'lobby':
                scene = 'lobby';
                break;
            case 'response':
                scene = 'promptResponse';
                break;
            case 'selection':
                scene = 'selection';
                break;
            case 'matching':
                scene = isSelector ? 'matchingSummary' : 'activeMatching';
                break;
            case 'endRound':
                scene = 'endRound';
                break;
        }
        commit('setScene', scene);
        dispatch('SOCKET_matchesFound', data.matches);

    }
}

const actions = {
    async startTimer({state, commit}) {
        clearTimeout(state.timeoutId);
        const initialTimer = state.timer;
        const interval = 1000; // 1s
        const maxTick = initialTimer * (1000 / interval);
        let expected = Date.now() + interval;
        let dt = 0;
        for (let tick = 1; tick <= maxTick; tick++) {
            await new Promise(resolve => {
                const timeoutId = setTimeout(resolve, Math.max(0, interval - dt));
                commit('setTimeoutId', timeoutId);
            });
            dt = Date.now() - expected; // the drift (positive for overshooting)
            expected += interval;
            commit('setTimer', initialTimer - tick * (interval / 1000));
        }
    },
    async unmatch({state, commit, rootGetters}) {
        const usedResponse = state.matches.find(match => match.player.id === rootGetters['room/self'].id).response;
        commit('setUsedResponses', state.usedResponses.filter(response => response !== usedResponse));
        commit('setScene', 'activeMatching');
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations: {...socketMutations, ...mutations},
    actions: {...socketActions, ...actions}
}