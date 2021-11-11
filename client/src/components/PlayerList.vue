<template>
  <div v-for="player in players">
    {{ player.name }}
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
