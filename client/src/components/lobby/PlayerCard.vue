import 
<template>
  <div class="w-100 shadow-lg p-3 m-1 rounded" :class="{'bg-danger': !player.active, 'bg-body': player.active}">
  <button v-on:click = "kickPlayer">
    <h4 class="text-center">{{ player.name }}</h4>
  </button>
  </div>
</template>

<script>

import {createNamespacedHelpers} from "vuex";
const { mapGetters } = createNamespacedHelpers('room')

export default {
  props: {
    player: Object
  },
  computed: {
    ...mapGetters([
      "localPlayer"
    ])
  },
    methods:{
    kickPlayer(){
      console.log(this.localPlayer);
     // const currentPlayer = room.players.find(player => player.name === this.name);
      if(this.localPlayer.leader === true && this.player.name !== this.localPlayer.name){
          console.log("emitting event");
          const endpoint = 'kickPlayer' 
          this.$socket.emit(endpoint, this.player.name, this.player.id);   
      }
    }

  }
}
</script>