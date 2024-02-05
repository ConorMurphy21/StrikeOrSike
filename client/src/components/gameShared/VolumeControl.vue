<!--suppress CssUnusedSymbol -->
<script setup lang="ts">
import { computed, type Ref, ref } from 'vue';
import { useSettingsStore } from '@/stores/settings.js';
import VueSlider from 'vue-slider-component';
const settingsStore = useSettingsStore();

const showing = ref(false);
const timer: Ref<null | NodeJS.Timeout> = ref(null);
const value = computed<number>({
  get(): number {
    return Math.round(settingsStore.volume * 100);
  },
  set(value: number): void {
    settingsStore.setVolume(value / 100);
  }
});

function click() {
  settingsStore.toggleMute();
}

function resetTimer() {
  clearTimer();
  timer.value = setTimeout(() => {
    timer.value = null;
    showing.value = false;
  }, 700);
}

function clearTimer() {
  showing.value = true;
  if (timer.value) {
    clearTimeout(timer.value);
  }
}
</script>

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
