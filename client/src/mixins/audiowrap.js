// won't adjust audio while playing, but will be fine for short audio clips
import { useSettingsStore } from '@/stores/settings.js';

export const AudioWrap = class {
    constructor(file) {
        this.audio = new Audio(file);

    }
    play() {
        const settings = useSettingsStore();
        this.audio.volume = settings.volume;
        this.audio.play().then(() => {});
    }
    pause() {
        this.audio.pause();
    }
    set volume(val) {
        this.audio.volume = val;
    }
    set currentTime(val) {
        this.audio.currentTime = val;
    }
}

