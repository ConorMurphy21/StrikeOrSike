<template>
  <div>
    <h1>{{$n(time)}}</h1>
  </div>
</template>

<script>
import timerMp3 from '@/assets/audio/timer_full.mp3';
const timerSound = new Audio(timerMp3);
import timerCompleteMp3 from '@/assets/audio/timerComplete.mp3';
const timerComplete = new Audio(timerCompleteMp3);
export default {
  props:{
    time: Number
  },
  watch:{
    //todo: change style and sounds
    "time": (val) => {
        if(val === 10){
          timerSound.play();
        } else if(val <= 0) {
          timerSound.pause();
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
}

</style>