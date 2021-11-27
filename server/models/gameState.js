const prompts = require('../resources/prompts.json')
const beginNewPrompt = (state) => {
    state.prompt = prompts[Math.floor(Math.random() * prompts.length)];
    state.stage = 'response';
    state.players.forEach(player => {
        player.responses = [];
        player.selected = -1;
    })
}

const defaultOptions = () => {
    return {
        promptTimer: 45,

    }
}

const createDefaultState = (room, options) => {
    const state = {
        stage: 'lobby', // enum: 'lobby', 'response', 'selection', 'refute'
        options,
        prompt: '',
        players: [],
        selector: 0
    };
    room.players.forEach(player => {
        state.players.push(
            {
                id: player.id,
                responses: [],
                selected: -1
            }
        )
    });
    return state;
}

module.exports = {createDefaultState, defaultOptions, beginNewPrompt}