// won't adjust audio while playing, but will be fine for short audio clips
import { useSettingsStore } from '@/stores/settings.js';

export const AudioWrap = class {
    private audio: HTMLAudioElement;
    constructor(file: string) {
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
    set volume(val: number) {
        this.audio.volume = val;
    }
    set currentTime(val: number) {
        this.audio.currentTime = val;
    }
}

