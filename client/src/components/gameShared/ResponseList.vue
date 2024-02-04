<!--suppress CssUnusedSymbol -->
<script setup lang="ts">
import { computed, ref } from 'vue';
import { AudioWrap } from '@/mixins/audiowrap.js';
import Click1Mp3 from '@/assets/audio/click1.mp3';
import Click2Mp3 from '@/assets/audio/click2.mp3';
import { useGameStore } from '@/stores/game.js';

const props = defineProps({
  selectable: {
    type: Boolean,
    required: true
  },
  playerId: {
    type: String,
    default: ''
  },
  height: {
    type: Number,
    default: 30
  }
});

const gameStore = useGameStore();

const model = defineModel({ type: String });

const selected = ref(-1);

const responses = computed((): string[] => {
  return gameStore.playerResponses(props.playerId).all;
});
const usedResponses = computed((): string[] => {
  return gameStore.playerResponses(props.playerId).used;
});
const selectedStrike = computed((): string => {
  return gameStore.playerResponses(props.playerId).selectedStrike;
});
const selectedSike = computed((): string => {
  return gameStore.playerResponses(props.playerId).selectedSike;
});
const cssProps = computed((): Record<string, string> => {
  return {
    '--max-height': props.height + 'vh'
  };
});

function select(index: number, response: string) {
  if (props.selectable && !used(response)) {
    if (selected.value !== index) {
      new AudioWrap(Click1Mp3).play();
      selected.value = index;
    } else {
      new AudioWrap(Click2Mp3).play();
      model.value = response;
    }
  }
}
function deselect() {
  new AudioWrap(Click2Mp3).play();
  selected.value = -1;
}
function confirm() {
  select(selected.value, responses.value[selected.value]);
}
function responseSelectable(response: string) {
  return !usedResponses.value.includes(response) && props.selectable;
}
function used(response: string) {
  return response !== selectedStrike.value && response !== selectedSike.value && usedResponses.value.includes(response);
}
</script>

<template>
  <div class="outer flex-grow-1 d-flex flex-column justify-content-between align-items-center w-100">
    <div
      :style="cssProps"
      class="box d-flex flex-column justify-content-center align-items-center w-75 m-2 overflow-auto">
      <div class="list-group w-100 h-100">
        <button
          v-for="(response, index) in responses"
          :key="response"
          class="list-group-item text-start fw-bold"
          :class="{
            'list-group-item-action': responseSelectable(response),
            'pe-none': !responseSelectable(response),
            active: selected === index,
            'list-group-item-orange': response === selectedStrike, // will override used
            'list-group-item-blue': response === selectedSike,
            'list-group-item-red': used(response)
          }"
          @click="select(index, response)">
          {{ response }}
        </button>
      </div>
    </div>
    <transition name="confirm">
      <div v-if="selected !== -1" class="d-flex flex-row gap-2 w-75 justify-content-between">
        <button v-t="'cancel'" class="btn btn-red w-50 w-lg-25" @click="deselect" />
        <button v-t="'confirm'" class="btn btn-blue w-50 w-lg-25" @click="confirm" />
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.outer {
  min-height: 200px;
}

.box {
  max-height: max(var(--max-height), 250px);
}

.confirm-enter-active,
.confirm-leave-active {
  transition: opacity 0.5s ease;
}

.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
}
</style>
