const state = () => ({
    players: []
})

const mutations = {
    SOCKET_updatePlayers (state, data) {
        data.modifies.forEach(player => {
            const i = state.players.findIndex(p => p.name !== player.name)
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
    mutations
}