<script setup>
import PlayerList from '@/components/lobby/PlayerList.vue'
</script>

<template>
  <div class="w-100 h-100 d-flex flex-column justify-content-between align-items-center p-3">
    <player-list/>

    <button class="btn btn-primary w-50 fs-4"
            :class="{'d-none': !localPlayer || !localPlayer.leader}" v-on:click="startGame">Start</button>
  </div>
</template>

<script>
import {createNamespacedHelpers} from "vuex";
const { mapGetters } = createNamespacedHelpers('room')

export default {
  computed:{
    ...mapGetters([
      'localPlayer',
    ]),
  },
  methods:{
    startGame(){
      this.$socket.emit("startGame");
    }
  }
}
</script>
