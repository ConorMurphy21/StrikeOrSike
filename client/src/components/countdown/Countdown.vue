<template>
  <div class="w-100 d-flex justify-content-center bounce">
    <h1 class="flip">{{ $n(timer) }}</h1>
  </div>
</template>

<script>
import timerMp3 from '@/assets/audio/countdown.mp3';
import {createNamespacedHelpers} from 'vuex';

const {mapState} = createNamespacedHelpers('game');


export default {
  computed: {
    ...mapState([
      'timer'
    ])
  },
  mounted() {
    new Audio(timerMp3).play();
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

</style>