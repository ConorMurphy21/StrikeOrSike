// noinspection JSUnusedGlobalSymbols
import router from '@/router';

const state = () => ({
    players: [],
    name: '',
    roomName: '',
    error: '',
    route: 'home',
})

const getters = {
    self: state => {
        return state.players.find(p => p.name === state.name);
    }
}

const mutations = {
    setName(state, data) {
        state.name = data;
    },
    setRoomName(state, data) {
        state.roomName = data;
    },
    setError(state, data) {
        state.error = data;
    },
    setRoute(state, data){
        state.route = data;
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

        });
        state.players = state.players.filter(player => !data.deletes.includes(player.id));
    }
}

const socketActions = {
    async SOCKET_joinRoom({state, commit, rootGetters, rootState}, data) {
        if (data.success) {
            commit('setRoomName', data.roomName);
            commit('setError', '');
            await router.push({name: 'game', params: {roomName: data.roomName}});
        } else {
            if (state.route !== 'home') {
                await router.push({name: 'home', params: {error: data.error}});
            } else {
                commit('setError', data.error);
            }
        }
    },
    async SOCKET_connect({state}) {
        // automatically try to rejoin last room if a reconnect event occurs
        if(state.name && state.roomName) {
            this.$socket.io.emit('joinRoom', state.name, state.roomName);
        }
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations: {...mutations, ...socketMutations},
    actions: socketActions
}