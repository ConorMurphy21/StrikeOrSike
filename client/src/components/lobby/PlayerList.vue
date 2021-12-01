<script setup>
import PlayerCard from '@/components/lobby/PlayerCard.vue'
</script>

<template>
  <div class="w-100 d-flex flex-column justify-content-center align-items-center mb-5">
    <div v-for="player in players" class="w-75">
      <button v-on:click = "kickPlayer(player.name, player.id)">
       <player-card v-bind:player="player"/>
      </button>
    </div>
  </div>
</template>

<script>
import {createNamespacedHelpers} from "vuex";
const { mapState } = createNamespacedHelpers('room')

export default {
  computed: {
    ...mapState({
      players: state => state.room.players
    })
  },
  method:{
    kickPlayer: function(selectedName, selectedID){
      //const currentPlayer = room.players.find(player => player.name === this.name);
      if(self.leader === true && selectedName !== self.name){
          console.log("emitting event");
          const endpoint = 'kickPlayer' 
          this.$socket.emit(endpoint, selectedName, selectedID);   
      }
    }

  }
}
</script>
