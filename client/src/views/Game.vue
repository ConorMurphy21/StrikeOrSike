<template>
  <div class="main-content w-xl-75 w-100 flex-grow-1">
    <component :is="scene"/>
  </div>
</template>

<script>
import Lobby from '@/components/lobby/Lobby.vue'
import Countdown from '@/components/countdown/Countdown.vue';
import PromptResponse from '@/components/promptResponse/PromptResponse.vue'
import Selection from '@/components/responseSelection/Selection.vue';
import ActiveMatching from '@/components/responseMatching/ActiveMatching.vue';
import MatchingSummary from '@/components/responseMatching/MatchingSummary.vue';
import EndRound from '@/components/endRound/EndRound.vue';
import EndGame from '@/components/endGame/EndGame.vue';
import {mapState} from 'vuex';


export default {
  components: {
    Lobby,
    Countdown,
    PromptResponse,
    Selection,
    ActiveMatching,
    MatchingSummary,
    EndRound,
    EndGame
  },
  props: {
    roomName: String
  },
  mounted() {
    if (this.roomName !== this.storeRoomName) {
      this.$router.push({name: 'home', query: {name: this.roomName}})
    }
  },
  computed: {
    ...mapState({
      scene: state => state.game.scene,
      storeRoomName: state => state.room.roomName
    })
  },
  sockets: {
    kickPlayer: function (data) {
      this.$router.push({name: 'home', query: {error: data.error}});
    }
  }
}
</script>

<style lang="scss" scoped>
.main-content {
//  min-height: 450px;
//  height: 70vh;
}
</style>
