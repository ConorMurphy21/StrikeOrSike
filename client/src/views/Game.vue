<template>
  <div class="main-content d-flex w-xl-75 w-100 flex-grow-1 p-1 position-relative">
    <a class="btn btn-burgundy position-absolute top-0 end-0 mt-2 me-2 bi-question py-0 px-1 fs-6" target="_blank"
       :href="helpLink"/>
    <component :is="scene"/>

    <portal to="banner">
      <a v-if="scene==='lobby' || scene==='endGame'" href="https://www.buymeacoffee.com/ConorMurphy/" target="_blank"
         class="link-yellow fs-6 text-center">
        <div class="d-flex align-items-center justify-content-center gap-1">
          <span v-t="'coffeeBannerLink'"/>
          <img :alt="$t('coffeeAlt')" src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
               height="25">
        </div>
      </a>
    </portal>

    <!-- client side preferences -->
    <div class="position-fixed bottom-0 end-0 m-4 gap-1 d-flex justify-content-end align-items-end" v-if="!isMobile">
      <tooltip-toggle class="mb-1"/>
      <volume-control/>
    </div>
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
import VolumeControl from '@/components/gameShared/VolumeControl.vue';
import TooltipToggle from '@/components/gameShared/TooltipToggle.vue';
import { mapState } from 'pinia';
import { useRoomStore } from '../stores/room.js';
import { useGameStore } from '../stores/game.js';

export default {
  components: {
    Lobby,
    Countdown,
    PromptResponse,
    Selection,
    ActiveMatching,
    MatchingSummary,
    EndRound,
    EndGame,
    VolumeControl,
    TooltipToggle,
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
    ...mapState(useGameStore, ['scene']),
    ...mapState(useRoomStore, {storeRoomName: 'roomName'}),
    helpLink() {
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
    },
    isMobile() {
      return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
  },
  sockets: {
    kickPlayer: function (data) {
      this.$router.push({name: 'home', query: {error: data.error}});
    }
  }
}
</script>