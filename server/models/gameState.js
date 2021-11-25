const {getRoomById} = require('./rooms');
const prompts = require('../resources/prompts.json')

const states = {}

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
    states[room.name] = {
        stage: 'lobby', // enum: 'lobby', 'response', 'selection', 'refute'
        options,
        prompt: '',
        players: [],
        selector: 0
    };
    room.players.forEach(player => {
        states[room.name].players.push(
            {
                id: player.id,
                responses: [],
                selected: -1
            }
        )
    });
    return states[room.name];
}

const getStateById = id => {
    return states[getRoomById(id).name];
}

const getStateByName = roomName => {
    return states[roomName];
}

const deleteState = roomName => {
    delete states[roomName];
}

module.exports = {getStateByName, getStateById, deleteState, createDefaultState, defaultOptions, beginNewPrompt}