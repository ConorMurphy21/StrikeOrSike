<script setup lang="ts">
import ClickMp3 from '@/assets/audio/click2.mp3';
import { AudioWrap } from '@/mixins/audiowrap.js';
import { computed, ref } from 'vue';
import type { Player } from ':common/stateTypes.js';
import { type Match, useGameStore } from '@/stores/game.js';
import { useRoomStore } from '@/stores/room.js';
import { useI18n } from 'vue-i18n';
const props = defineProps<{
  player: Player;
  match: Match;
}>();

const click = new AudioWrap(ClickMp3);

const hovering = ref(false);

const gameStore = useGameStore();
const roomStore = useRoomStore();

const showUnmatch = computed<boolean>(() => {
  return props.player?.name === roomStore.name && !props.match?.exact;
});

function unmatchClick() {
  click.play();
  gameStore.unmatch();
}

const { t } = useI18n();
</script>

<template>
  <div class="root d-flex flex-column gap-0">
    <div class="d-flex flex-row w-100 gap-1 justify-content-center align-items-center">
      <h2 v-if="match && match.response" class="match-content fs-3">
        {{ match.response }}
      </h2>
      <img v-else-if="match" class="fs-3" src="@/assets/images/sike.png" :alt="t('sike')" />
      <div v-else class="p-3 d-flex justify-content-center align-items-center position-relative">
        <div class="dot-pulse" />
      </div>
      <a
        v-if="showUnmatch"
        class="bi-trash3-fill text-red fw-bolder fs-4"
        :class="{ hover: hovering }"
        @click="unmatchClick"
        @mouseenter="hovering = true"
        @mouseleave="hovering = false" />
    </div>
    <h2 class="player-name fs-5">{{ player!.name }}</h2>
  </div>
</template>

<style lang="scss" scoped>
.root {
  width: 150px;
  max-width: 150px;
}

.match-content {
  font-weight: bolder;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
  color: $orange;
  margin-bottom: auto;
  margin-top: auto;
  white-space: nowrap;
  max-height: 45px;
}
.player-name {
  max-width: 150px;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
}

a {
  transition: all 75ms ease-out;
}

.hover {
  transform: rotate(16deg) scale(1.09);
  cursor: pointer;
}

img {
  display: block;
  text-align: center;
  color: $blue;
  max-height: 45px;
}
</style>
