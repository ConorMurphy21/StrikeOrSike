<script setup>
import PlayerCard from '@/components/lobby/PlayerCard.vue'
</script>

<template>
  <div class="w-100 d-flex flex-column justify-content-center align-items-center mb-5">
    <div v-for="player in players" class="w-75">
      <player-card v-bind:player="player"/>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'

export default {
  computed: {
    ...mapState({
      players: state => state.room.players
    })
  }
}
</script>
