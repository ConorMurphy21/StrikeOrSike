<template>
  <div>
    <h1 class="display-3">{{ $n(time) }}</h1>
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
  font-weight: 600;
  color: black;
  text-align: center;
  margin: auto;
}

</style>