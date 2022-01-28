<template>
  <div>
    <h1>{{$n(time)}}</h1>
  </div>
</template>

<script>
import timerMp3 from '@/assets/audio/timer.mp3';
import timerCompleteMp3 from '@/assets/audio/timerComplete.mp3';
const timerComplete = new Audio(timerCompleteMp3);
export default {
  props:{
    time: Number
  },
  watch:{
    //todo: change style and sounds
    "time": (val) => {
        if(val <= 10 && val > 0){
          new Audio(timerMp3).play();
        } else if(val <= 0) {
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