<!--suppress CssUnusedSymbol -->
<template>
  <div
    class="d-flex flex-column justify-content-center align-items-center"
    @mouseenter="clearTimer"
    @mouseleave="resetTimer">
    <transition>
      <vue-slider
        v-if="showing"
        v-model="value"
        direction="btt"
        height="80px"
        :duration="0.3"
        @focusin="clearTimer"
        @focusout="resetTimer" />
    </transition>
    <button
      class="text-black"
      :class="{
        'bi-volume-up-fill': value > 50,
        'bi-volume-down-fill': value <= 50 && value > 0,
        'bi-volume-mute-fill': value === 0
      }"
      @click="click"
      @focusin="clearTimer"
      @focusout="resetTimer" />
  </div>
</template>
<script lang="ts">
import VueSlider from 'vue-slider-component';
import { useSettingsStore } from '@/stores/settings.js';
import { mapActions, mapState } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    VueSlider
  },
  data() {
    return {
      showing: false,
      timer: null as null | NodeJS.Timeout
    };
  },
  computed: {
    ...mapState(useSettingsStore, ['volume']),
    value: {
      set: function (val: number) {
        this.setVolume(val / 100);
      },
      get: function () {
        return Math.round(this.volume * 100);
      }
    }
  },
  methods: {
    ...mapActions(useSettingsStore, ['setVolume', 'toggleMute']),
    click() {
      this.toggleMute();
    },
    resetTimer() {
      this.clearTimer();
      this.timer = setTimeout(() => {
        this.timer = null;
        this.showing = false;
      }, 700);
    },
    clearTimer() {
      this.showing = true;
      if (this.timer) {
        clearTimeout(this.timer);
      }
    }
  }
});
</script>

<style scoped lang="scss">
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}
button {
  font-size: 48px;
  background: none;
  border: none;
  outline: none;
}

button:hover {
  text-shadow: 0 0 18px $red;
  cursor: pointer;
}

button:focus {
  text-shadow: 0 0 18px $red;
  cursor: pointer;
}
</style>
