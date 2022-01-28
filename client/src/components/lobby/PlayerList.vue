<template>
  <div class="player-list d-flex flex-row justify-content-evenly w-100 gap-4 px-4 flex-grow-1">
    <div class="d-flex flex-column justify-content-start align-items-center w-50 gap-4" v-for="column in columns">
      <player-card v-for="player in column" :player="player"/>
    </div>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import PlayerCard from '@/components/lobby/PlayerCard.vue'

const {mapState} = createNamespacedHelpers('room')

export default {
  components: {
    PlayerCard
  },
  computed: {
    ...mapState([
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
