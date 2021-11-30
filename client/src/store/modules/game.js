const state = () => ({
    scene: 'lobby',
    prompt: '',
    timer: 0,
    responses: [],
    selectionType: ''
});

const mutations = {
    setScene(state, data){
        state.scene = data;
    },
    setPrompt(state, data){
        state.prompt = data;
    },
    setTimer(state, data){
        state.timer = data;
    },
    clearResponses(state){
        state.responses = [];
    }
}

const socketMutations = {
    SOCKET_promptResponse(state, data){
        state.responses.push(data);
    }
}

const socketActions = {
    async SOCKET_beginPrompt({state, commit, dispatch}, data) {
        commit('setScene', 'promptResponse');
        commit('setPrompt', data.prompt);
        commit('setTimer', data.timer);
        commit('clearResponses')
        dispatch('startTimer').then(() => {
            commit('setScene', 'lobby');
        })
    }
}

const actions = {
    async startTimer({ state, commit }) {
        return new Promise(async (resolve) => {
            while (state.timer > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                commit('setTimer', state.timer-1);
            }
            resolve();
        })
    }
}

export default {
    namespaced: true,
    state,
    mutations: {...socketMutations, ...mutations},
    actions: {...socketActions, ...actions}
}