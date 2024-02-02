<script setup lang="ts">
import ClickMp3 from '@/assets/audio/click2.mp3';
import { AudioWrap } from '@/mixins/audiowrap.js';
import { computed } from 'vue';
import { useGameStore } from '@/stores/game.js';
import { useI18n } from 'vue-i18n';

const click = new AudioWrap(ClickMp3);

const gameStore = useGameStore();

const rank = computed((): number[] => {
  let result = [];
  let lastScore = -1;
  let lastRank = 1;
  for (const [rank, score] of gameStore.scores.entries()) {
    if (score.points < lastScore) {
      result.push(rank + 1);
      lastRank = rank + 1;
    } else {
      result.push(lastRank);
    }
    lastScore = score.points;
  }
  return result;
});

function toLobby() {
  click.play();
  gameStore.setScene('Lobby');
}

const { n } = useI18n();
</script>

<template>
  <div class="w-100 d-flex flex-column justify-content-start align-items-center gap-3 py-3 px-4">
    <h1 v-t="'playerScores'" class="mt-2 text-center display-1 text-red font-fancy" />

    <div class="list-group w-75 w-xl-50">
      <div v-for="(score, index) in gameStore.scores" :key="score.player.id" class="list-group-item">
        {{ rank[index] }}. {{ score.player.name }}: {{ n(score.points) }}
      </div>
    </div>

    <div class="flex-grow-1" />
    <button v-t="'toLobby'" class="btn btn-blue w-75 w-lg-50 fs-4 mb-4" @click="toLobby" />
  </div>
</template>
