const state = () => ({
    players: [{name: 'hewwo'}]
})

const mutations = {
    SOCKET_updatePlayers (state, data) {
        data.modifies.forEach(player => {
            state.players.filter(p => p.name !== player.name)
            state.players.push(player)
        })
        data.deletes.forEach(player => {
            state.players.filter(p => p.name !== player.name)
        })
    }
}

export default {
    namespaced: true,
    state,
    mutations
}