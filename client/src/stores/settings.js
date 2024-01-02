import { defineStore } from 'pinia';

const state = () => ({
  volume: 1,
  // used for muting and unmuting
  lastVolume: 1,
  showTooltips: true,
  tooltipUpdateFuncs: []
});

const actions = {
  setVolume(data) {
    this.lastVolume = this.volume;
    this.volume = data;
  },
  setShowTooltips(data) {
    this.showTooltips = data;
    for (const func of this.tooltipUpdateFuncs) {
      func();
    }
  },
  toggleMute() {
    if (this.volume) {
      this.lastVolume = this.volume;
      this.volume = 0;
    } else {
      this.volume = this.lastVolume;
    }
  },
  addTooltipUpdateFunc(data) {
    this.tooltipUpdateFuncs.push(data);
  },
  removeTooltipUpdateFunc(data) {
    const index = this.tooltipUpdateFuncs.indexOf(data);
    if (index !== -1) {
      this.tooltipUpdateFuncs.splice(index, 1);
    }
  }
};


export const useSettingsStore = defineStore('settings', {
  state,
  actions
});