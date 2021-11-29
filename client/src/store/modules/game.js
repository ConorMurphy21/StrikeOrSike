const state = () => ({
    scene: 'lobby',
    prompt: '',
    timer: 0,
    responses: [],
    selectionType: ''
});

const socketMutations = {
    SOCKET_beginPrompt(state, data) {
        state.scene = 'promptResponse';
        state.prompt = data.prompt;
        state.timer = data.timer;
        state.responses = [];
    },
    SOCKET_promptResponse(state, data){
        state.responses.push(data);
    }
}

const actions = {
    async startTimer({ state }) {
        while (state.timer > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            state.timer--;
        }
    }
}

export default {
    namespaced: true,
    state,
    mutations: socketMutations,
    actions
}