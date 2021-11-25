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
    state
}