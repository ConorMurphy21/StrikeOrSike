<script setup lang="ts">
import { computed, ref } from 'vue';
import { AudioWrap } from '@/mixins/audiowrap.js';
import Click2Mp3 from '@/assets/audio/click2.mp3';
import Click1Mp3 from '@/assets/audio/click1.mp3';
import { useRoomStore } from '@/stores/room.js';
import { type Player } from ':common/stateTypes.js';

const roomStore = useRoomStore();
const hoverLeft = ref(false);
const hoverRight = ref(false);
const model = defineModel({ type: String, required: true });

const selectedName = computed<string>(() => {
  if (!model.value) return '';
  const name = roomStore.players.find((player: Player) => player.id === model.value)?.name;
  return name === undefined ? '' : name;
});

const activePlayers = computed<Player[]>(() => {
  return roomStore.players.filter((player: Player) => player.active);
});

function nextPlayer(right: boolean) {
  const direction = right ? 1 : -1;
  const players = activePlayers.value;
  let index = players.findIndex((player: Player) => player.id === model.value);
  index = (index + direction + players.length) % players.length;
  model.value = players[index].id;
  new AudioWrap(Click2Mp3).play();
}
function clickOption(value: string) {
  model.value = value;
  new AudioWrap(Click2Mp3).play();
}
function clickDropdown() {
  new AudioWrap(Click1Mp3).play();
}
</script>

<template>
  <div class="d-flex flex-row justify-content-center align-items-center gap-2">
    <a
      class="bi-caret-left-fill"
      :class="{ hover: hoverLeft, 'text-dark': !hoverLeft }"
      @mouseenter="hoverLeft = true"
      @mouseleave="hoverLeft = false"
      @click="nextPlayer(false)" />
    <div class="dropdown flex-grow-1">
      <button
        id="playerChooser"
        class="btn btn-dark w-100 cutoff-text"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        @click="clickDropdown()">
        {{ selectedName }}
      </button>
      <ul class="dropdown-menu w-100" aria-labelledby="playerChooser">
        <li v-for="player in activePlayers" :key="player.id">
          <button class="btn dropdown-item cutoff-text text-center" @click="clickOption(player.id)">
            {{ player.name }}
          </button>
        </li>
      </ul>
    </div>
    <a
      class="bi-caret-right-fill"
      :class="{ hover: hoverRight, 'text-dark': !hoverRight }"
      @mouseenter="hoverRight = true"
      @mouseleave="hoverRight = false"
      @click="nextPlayer(true)" />
  </div>
</template>

<style lang="scss" scoped>
.cutoff-text {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.hover {
  cursor: pointer;
  color: tint-color($dark, 15%);
}
</style>
