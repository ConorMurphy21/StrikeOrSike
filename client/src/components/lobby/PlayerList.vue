<script setup>
import PlayerCard from '@/components/lobby/PlayerCard.vue'
</script>

<template>
  <div class="w-100 d-flex flex-column justify-content-center align-items-center mb-5">
    <div v-for="player in players" class="w-75">
<<<<<<< Updated upstream

       <player-card v-bind:player="player"/>

=======
      <button v-on:click = "kickPlayer(player.id, player.name)">
       <player-card v-bind:player="player"/>
      </button>
>>>>>>> Stashed changes
    </div>
  </div>
</template>

<script>
import {createNamespacedHelpers} from "vuex";
const { mapState } = createNamespacedHelpers('room')

export default {
  computed: {
<<<<<<< Updated upstream
    ...mapState([
      "players"
    ])
  },

=======
    ...mapState({
      players: state => state.room.players
    })
  },
  method:{
    kickPlayer: function(selectedID, selectedName){
      const currentPlayer = room.players.find(player => player.name === this.name);
      if(currentPlayer.player.leader == true && selectedName != currentPlayer.player.name){
          console.log("emitting event");
          const endpoint = 'kickPlayer' 
          this.$socket.emit(endpoint, player.name, player.id);   
      }
    }
  }
>>>>>>> Stashed changes
}
</script>
