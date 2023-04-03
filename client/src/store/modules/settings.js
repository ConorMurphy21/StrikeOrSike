const state = () => ({
    volume: 0.8,
    // used for muting and unmuting
    lastVolume: 0.8,
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