<template>
  <div class="position-fixed bottom-0 end-0 m-4 d-flex flex-column justify-content-center align-items-center"
       @mouseenter="clearTimer" @mouseleave="resetTimer">
    <transition>
      <vue-slider v-show="showing" v-model="value" direction="btt" height="80px" :duration="0.3" />
    </transition>
    <button class="btn btn-sm fs-1 text-black"
            :class="{
                'bi-volume-up-fill': value > 50,
                'bi-volume-down-fill': value <= 50 && value > 0,
                'bi-volume-mute-fill': value === 0}"
            @click="click"/>
  </div>
</template>
<script>
import {createNamespacedHelpers} from 'vuex';
import VueSlider from 'vue-slider-component';

const {mapState, mapMutations} = createNamespacedHelpers('settings');
export default {
  components: {
    VueSlider
  },
  data() {
    return {
      showing: false,
      timer: null
    }
  },
  computed: {
    ...mapState([
      'volume'
    ]),
    value: {
      set: function (val) {
        this.setVolume(val / 100);
      },
      get: function () {
        return Math.round(this.volume * 100);
      }
    },
  },
  methods: {
    ...mapMutations([
      'setVolume',
      'toggleMute'
    ]),
    click() {
        this.toggleMute();
    },
    resetTimer() {
      this.clearTimer();
      this.timer = setTimeout(() => {
        this.timer = null;
        this.showing = false;
      }, 1200);
    },
    clearTimer() {
      this.showing = true;
      if(this.timer){
        clearTimeout(this.timer);
      }
    }
  }
}
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}
button {
  border: none;
}
</style>