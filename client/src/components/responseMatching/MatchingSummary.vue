<script setup lang="ts">
import Prompt from '@/components/gameShared/Prompt.vue';
import DisputeIcon from '@/components/responseMatching/DisputeIcon.vue';
import SelectionType from '@/components/gameShared/SelectionType.vue';
import MatchCard from '@/components/responseMatching/MatchCard.vue';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import type { Player } from ':common/stateTypes.js';
import socket from '@/socket/socket.js';
import { type Match, useGameStore } from '@/stores/game.js';
import { AudioWrap } from '@/mixins/audiowrap.js';
import ClickMp3 from '@/assets/audio/click2.mp3';
import { useRoomStore } from '@/stores/room.js';

const click = new AudioWrap(ClickMp3);

const gameStore = useGameStore();
const roomStore = useRoomStore();

const matchers = computed<Player[]>(() => {
  return roomStore.players.filter((player: Player) => player.active && player.id !== gameStore.selector.id);
});

function endRound(): void {
  click.play();
  socket.emit('selectionComplete');
}

function match(player: Player): Match {
  return gameStore.matches.find((match: { player: Player }) => player.id === match.player.id)!;
}

const { t, n } = useI18n();
</script>

<template>
  <div class="w-100 d-flex flex-column align-items-center justify-content-between gap-2 py-3 px-4">
    <div class="w-100 d-flex flex-column align-items-center justify-content-start">
      <prompt :prompt="gameStore.prompt" />
      <h3 v-if="gameStore.isSelector" class="fs-3">
        {{ t('selfScoreMessage', { score: n(gameStore.roundPoints) }) }}
      </h3>
      <h3 v-else class="fs-3">
        {{ t('scoreMessage', { player: gameStore.selector!.name, score: n(gameStore.roundPoints) }) }}
      </h3>
      <span class="d-flex flex-row align-items-center justify-content-center gap-2">
        <span class="fs-2 fw-bolder text-red my-auto">{{ gameStore.selectedResponse }}</span>
        <dispute-icon
          v-if="gameStore.sikeDisputeCount"
          :disabled="gameStore.isSelector"
          :response="gameStore.selectedResponse"
          :placement="'right'" />
      </span>
      <div class="w-75 d-flex justify-content-center align-items-center">
        <selection-type />
      </div>
    </div>

    <div class="matches d-flex flex-row w-75 gap-2 justify-content-around align-items-center">
      <match-card v-for="player in matchers" :key="player.id" :player="player" :match="match(player)" />
    </div>

    <button
      v-t="'cont'"
      class="btn btn-blue w-50 fs-4 mb-3"
      :class="{ invisible: !gameStore.canEndRound }"
      @click="endRound"></button>
  </div>
</template>

<style lang="scss" scoped>
.matches {
  overflow-x: auto;
  flex-flow: wrap;
  overflow-y: auto;
  max-height: 25vh;
}
</style>
