const prompts = require('../resources/prompts.json')

const beginNewPrompt = (state) => {
    state.prompt = prompts[Math.floor(Math.random() * prompts.length)];
    state.stage = 'response';
    state.players.forEach(player => {
        player.responses = [];
        player.selected = -1;
    })
}

const randomizeSelectionType = (state) => {
    const r = Math.floor(Math.random() * 6);
    if(r < 3){
        state.selectionType = 'strike';
    } else if(r < 5){
        state.selectionType = 'sike';
    } else {
        state.selectionType = 'choice';
    }
}

const beginSelectionState = (room) => {
    const state = room.state;

    //clear selections
    state.players.forEach(player => {
        player.selected = -1;
    });

    // update global state for selection

    for(let i = state.initialSelector; ; i = (i + 1) % state.players.length){
        const active = room.players.find(player => player.id === state.players[i].id).active;
        if(active){
            state.initialSelector = i;
            state.selector = i;
            randomizeSelectionType(state);
            return;
        }
    }
}

const nextSelectionState = (room) => {
    const state = room.state;

    //clear selections
    state.players.forEach(player => {
        player.selected = -1;
    });

    for(let i = state.selector; i !== state.initialSelector; i = (i + 1) % state.players.length){
        const active = room.players.find(player => player.id === state.players[i].id).active;
        if(active){
            state.selector = i;
            randomizeSelectionType(state);
            return true;
        }
    }
    state.initialSelector = (state.initialSelector + 1) % state.players.length;
    return false;
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
        initialSelector: 0,
        selector: 0,
        selectionType: ''
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

module.exports = {createDefaultState, defaultOptions, beginNewPrompt, beginSelectionState, nextSelectionState}