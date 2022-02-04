<template>
  <div class="main-content w-93 w-md-75">
    <component :is="scene"/>
  </div>
</template>

<script>
import Lobby from '@/components/lobby/Lobby.vue'
import Countdown from '@/components/countdown/Countdown.vue';
import PromptResponse from '@/components/promptResponse/PromptResponse.vue'
import Selection from '@/components/responseSelection/Selection.vue';
import ActiveDispute from '@/components/dispute/ActiveDispute.vue';
import PassiveDispute from '@/components/dispute/PassiveDispute.vue';
import ActiveMatching from '@/components/responseMatching/ActiveMatching.vue';
import MatchingSummary from '@/components/responseMatching/MatchingSummary.vue';
import EndGame from '@/components/endGame/EndGame.vue';
import {mapState} from 'vuex';


export default {
  components: {
    Lobby,
    Countdown,
    PromptResponse,
    Selection,
    ActiveDispute,
    PassiveDispute,
    ActiveMatching,
    MatchingSummary,
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
  height: 70vh;
}
</style>
