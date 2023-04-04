const state = () => ({
    volume: 1,
    // used for muting and unmuting
    lastVolume: 1,
});

const mutations = {
    setVolume(state, data) {
        state.lastVolume = state.volume;
        state.volume = data;
    },
    toggleMute(state) {
        if(state.volume) {
            state.lastVolume = state.volume;
            state.volume = 0;
        } else {
            state.volume = state.lastVolume;
        }
    }
}


export default {
    namespaced: true,
    state,
    mutations,
}