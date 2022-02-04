<template>
  <div>
    <h1>{{ $n(time) }}</h1>
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
      if (val <= 10) {
        timer.play();
      } else if (val <= 0) {
        timer.pause();
        timerComplete.play();
      }
    }
  }
}
</script>

<style lang="scss" scoped>
h1 {
  font-size: 3.25rem;
  color: black;
  text-align: center;
  margin: auto;
}

</style>