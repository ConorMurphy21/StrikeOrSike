<template>
  <div class="w-100 d-flex justify-content-center bounce">
    <h1 class="flip">{{ $n(timer) }}</h1>
  </div>
</template>

<script>
import timerMp3 from '@/assets/audio/countdown.mp3';
import {createNamespacedHelpers} from 'vuex';
import {AudioWrap} from '@/mixins/audiowrap';

const game = createNamespacedHelpers('game');
const settings = createNamespacedHelpers('settings');

const timer = new AudioWrap(timerMp3);

export default {
  computed: {
    ...game.mapState([
      'timer'
    ]),
    ...settings.mapState([
      'volume'
    ])
  },
  watch: {
    volume(val){
      timer.volume = val;
    }
  },
  mounted() {
    timer.play();
  },
}
</script>

<style lang="scss" scoped>
h1 {
  font-family: $header-font;
  font-size: 6rem;
  font-weight: normal;
  color: $orange;
  text-align: center;
  margin: auto;
}

.bounce {
  animation: bounce 1s cubic-bezier(.33,.47,.28,.93) infinite;
}

.flip {
  animation: flip 1s cubic-bezier(.81,.06,.89,.25) infinite;
}

@keyframes flip {
  0%{
    transform: rotate(0deg);
  }
  100%{
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
}
</style>