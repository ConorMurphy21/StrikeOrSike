<template>
  <div class="w-100 d-flex justify-content-center bounce">
    <h1 class="flip">{{ $n(timer) }}</h1>
  </div>
</template>

<script lang="ts">
import timerMp3 from "@/assets/audio/countdown.mp3";
import { AudioWrap } from "@/mixins/audiowrap.js";
import { useGameStore } from "@/stores/game.js";
import { useSettingsStore } from "@/stores/settings.js";
import { mapState } from "pinia";
import { defineComponent } from "vue";

const timer = new AudioWrap(timerMp3);

export default defineComponent({
  computed: {
    ...mapState(useGameStore, ["timer"]),
    ...mapState(useSettingsStore, ["volume"]),
  },
  watch: {
    volume(val: number) {
      timer.volume = val;
    },
  },
  mounted() {
    timer.play();
  },
});
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
  animation: bounce 1s cubic-bezier(0.33, 0.47, 0.28, 0.93) infinite;
}

.flip {
  animation: flip 1s cubic-bezier(0.81, 0.06, 0.89, 0.25) infinite;
}

@keyframes flip {
  0% {
    transform: rotate(0deg);
  }
  100% {
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
