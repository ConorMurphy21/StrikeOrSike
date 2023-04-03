
import store from '../store';

// won't adjust audio while playing, but will be fine for short audio clips
export const AudioWrap = class {
    constructor(file) {
        this.audio = new Audio(file);
    }
    play() {
        this.audio.volume = store.state.settings.volume;
        this.audio.play();
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

