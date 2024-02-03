<script setup lang="ts">
import { computed } from 'vue';
import type { Player } from ':common/stateTypes';
import PlayerCard from '@/components/lobby/PlayerCard.vue';
import { useRoomStore } from '@/stores/room';

const roomStore = useRoomStore();

const columns = computed((): [Player[], Player[]] => {
  const columns = [[], []] as [Player[], Player[]];
  for (let i = 0; i < roomStore.players.length; i++) {
    columns[i % 2].push(roomStore.players[i]);
  }
  return columns;
});
</script>

<template>
  <div class="player-list d-flex flex-column flex-md-row align-items-start w-100 gap-4 px-4 flex-grow-1">
    <!-- eslint-disable-next-line vue/require-v-for-key -->
    <div
      v-for="column in columns"
      class="d-flex flex-column justify-content-start align-items-center gap-4 w-100 w-md-50">
      <player-card v-for="player in column" :key="player.id" :player="player" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.player-list {
  overflow-y: auto;
  scrollbar-width: thin;
}
</style>
