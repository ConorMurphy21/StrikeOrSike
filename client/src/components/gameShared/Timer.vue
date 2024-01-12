<template>
  <div>
    <h1
      v-if="time"
      class="display-5"
      :class="{
        'bounce bold-black': time > 10,
        'bounce-fast bolder-red': time <= 10
      }">
      {{ $n(time) }}
    </h1>
    <h1 v-else class="display-5 bolder-red shake-rotate">
      <i class="bi-alarm" />
    </h1>
  </div>
</template>

<script lang="ts">
import timerMp3 from '@/assets/audio/timer_full.mp3';
import timerCompleteMp3 from '@/assets/audio/timerComplete.mp3';
import { AudioWrap } from '@/mixins/audiowrap.js';
import { useSettingsStore } from '@/stores/settings.js';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';

const timer = new AudioWrap(timerMp3);
const timerComplete = new AudioWrap(timerCompleteMp3);
export default defineComponent({
  props: {
    time: {
      type: Number,
      required: true
    }
  },
  computed: {
    ...mapState(useSettingsStore, ['volume'])
  },
  watch: {
    volume(val: number) {
      timer.volume = val;
    },
    time(val: number) {
      if (val === 10) {
        timer.play();
      } else if (val <= 0) {
        timer.pause();
        timer.currentTime = 0;
        timerComplete.play();
      }
    }
  },
  unmounted() {
    timer.pause();
    timer.currentTime = 0;
  }
});
</script>

<style lang="scss" scoped>
h1 {
  text-align: center;
  margin: auto;
}

.bold-black {
  color: $dark;
  font-weight: 600;
}

.bolder-red {
  font-weight: bolder;
  color: $red;
}

.bounce {
  animation: bounce 1s ease-in-out infinite;
}

.bounce-fast {
  animation: bounce 0.5s ease-in-out infinite;
}

@keyframes bounce {
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

@keyframes bounce-big {
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.25);
  }
}

.flip {
  animation: flip 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.shake-rotate {
  animation: shake-rotate 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes flip {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(180deg);
  }
}

@keyframes flip {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(180deg);
  }
}

@keyframes shake-rotate {
  10%,
  90% {
    transform: rotate(-8deg);
  }

  20%,
  80% {
    transform: rotate(8deg);
  }

  30%,
  50%,
  70% {
    transform: rotate(-16deg);
  }

  40%,
  60% {
    transform: rotate(16deg);
  }
}
</style>
