<template>
  <div class="main-content d-flex w-xl-75 w-100 flex-grow-1 p-1 position-relative">
    <a class="btn btn-burgundy position-absolute top-0 end-0 m-2 bi-question py-0 px-1" target="_blank" :href="helpLink"/>
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
    }),
    helpLink(){
      const tips = {
        lobby: '#overview',
        countdown: '#prompt',
        promptResponse: '#prompt',
        selection: '#selection',
        activeMatching: '#matching',
        matchingSummary: '#matching',
        endRound: '#overview',
        endGame: '#overview',
      }
      return this.$router.resolve({name: 'howToPlay', hash: tips[this.scene]}).href
    }
  },
  sockets: {
    kickPlayer: function (data) {
      this.$router.push({name: 'home', query: {error: data.error}});
    }
  }
}
</script>