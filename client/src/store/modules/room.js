// noinspection JSUnusedGlobalSymbols

const state = () => ({
    players: [],
    name: '',
    roomName: ''
})

const getters = {
    self: state => {
        return state.players.find(p => p.name === state.name)
    }
}

const mutations = {
    setName(state, data){
        state.name = data
    },
    setRoomName(state, data){
        state.roomName = data
    }
}

const socketMutations = {
    SOCKET_updatePlayers(state, data) {
        data.modifies.forEach(player => {
            const i = state.players.findIndex(p => p.name === player.name)
            if (i < 0)
                state.players.push(player)
            else
                state.players[i] = player

        })
        state.deletes = state.deletes.filter(player => {
            data.deletes.find(id => id === player.id);
        })
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations: {...mutations, ...socketMutations}
}