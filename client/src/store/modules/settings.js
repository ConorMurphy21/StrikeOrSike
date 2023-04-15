const state = () => ({
    volume: 1,
    // used for muting and unmuting
    lastVolume: 1,
    showTooltips: true,
    tooltipUpdateFuncs: []
});

const mutations = {
    setVolume(state, data) {
        state.lastVolume = state.volume;
        state.volume = data;
    },
    setShowTooltips(state, data) {
        state.showTooltips = data;
        for(const func of state.tooltipUpdateFuncs) {
            func();
        }
    },
    toggleMute(state) {
        if(state.volume) {
            state.lastVolume = state.volume;
            state.volume = 0;
        } else {
            state.volume = state.lastVolume;
        }
    },
    addTooltipUpdateFunc(state, data) {
        state.tooltipUpdateFuncs.push(data);
    },
    removeTooltipUpdateFunc(state, data) {
        const index = state.tooltipUpdateFuncs.indexOf(data);
        if (index !== -1) {
            state.tooltipUpdateFuncs.splice(index, 1);
        }
    }
}


export default {
    namespaced: true,
    state,
    mutations,
}