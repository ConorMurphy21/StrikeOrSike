import { defineStore } from "pinia";

interface State {
  volume: number;
  lastVolume: number;
  showTooltips: boolean;
  tooltipUpdateFuncs: (() => void)[];
}

export const useSettingsStore = defineStore("settings", {
  state: (): State => ({
    volume: 1,
    // used for muting and unmuting
    lastVolume: 1,
    showTooltips: true,
    tooltipUpdateFuncs: [],
  }),
  actions: {
    setVolume(volume: number) {
      this.lastVolume = this.volume;
      this.volume = volume;
    },
    setShowTooltips(showTooltips: boolean) {
      this.showTooltips = showTooltips;
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
    addTooltipUpdateFunc(data: () => void) {
      this.tooltipUpdateFuncs.push(data);
    },
    removeTooltipUpdateFunc(data: () => void) {
      const index = this.tooltipUpdateFuncs.indexOf(data);
      if (index !== -1) {
        this.tooltipUpdateFuncs.splice(index, 1);
      }
    },
  },
});
