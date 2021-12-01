const state = () => ({
    players: [],
    name: '',
    roomName: ''
})

const getters = {
    localPlayer: state => {
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
        data.deletes.forEach(player => {
            const i = state.players.findIndex(p => p.name !== player.name)
            state.players.splice(i, 1);
        })
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations: {...mutations, ...socketMutations}
}