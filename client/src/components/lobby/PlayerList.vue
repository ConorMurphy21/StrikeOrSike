<template>
  <div class="player-list d-flex flex-column flex-md-row align-items-start w-100 gap-4 px-4 flex-grow-1">
    <div class="d-flex flex-column justify-content-start align-items-center gap-4 w-100 w-md-50" v-for="column in columns">
      <player-card v-for="player in column" :player="player"/>
    </div>
  </div>
</template>

<script>
import PlayerCard from '@/components/lobby/PlayerCard.vue'
import { useRoomStore } from '@/stores/room.js';
import { mapState } from 'pinia';

export default {
  components: {
    PlayerCard
  },
  computed: {
    ...mapState(useRoomStore, [
      'players'
    ]),
    columns() {
      const columns = [[], []]
      for (let i = 0; i < this.players.length; i++) {
        columns[i % 2].push(this.players[i]);
      }
      return columns;
    }
  }
}
</script>

<style lang="scss" scoped>
.player-list {
  overflow-y: auto;
  scrollbar-width: thin;
}
</style>
