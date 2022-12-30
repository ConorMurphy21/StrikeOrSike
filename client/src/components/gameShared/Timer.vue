<template>
  <div>
    <h1 v-if='time' class="display-5" :class="{'bounce bold-black': time > 10, 'bounce-fast bolder-red': time <= 10}">
      {{ $n(time) }}
    </h1>
    <h1 v-else class="display-5 bolder-red bounce">
      <i class="bi-hourglass-bottom"/>
    </h1>
  </div>
</template>

<script>
import timerMp3 from '@/assets/audio/timer_full.mp3';
import timerCompleteMp3 from '@/assets/audio/timerComplete.mp3';

const timer = new Audio(timerMp3);
const timerComplete = new Audio(timerCompleteMp3);
export default {
  props: {
    time: Number
  },
  watch: {
    'time': (val) => {
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
}
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


</style>