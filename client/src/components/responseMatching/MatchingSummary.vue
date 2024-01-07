<template>
  <div class="w-100 d-flex flex-column align-items-center justify-content-between gap-2 py-3 px-4">

    <div class="w-100 d-flex flex-column align-items-center justify-content-start">
      <prompt :prompt="prompt"/>
      <h3 v-if="isSelector" class="fs-3">
        {{ $t('selfScoreMessage', {score: $n(roundPoints)}) }}
      </h3>
      <h3 v-else class="fs-3">
        {{ $t('scoreMessage', {player: selector.name, score: $n(roundPoints)}) }}
      </h3>
      <span class="d-flex flex-row align-items-center justify-content-center gap-2">
        <span class="fs-2 fw-bolder text-red my-auto">{{ selectedResponse }}</span>
        <dispute-icon :disabled="isSelector" v-if="sikeDisputeCount"
                      :response="selectedResponse" :placement="'right'"/>
      </span>
      <div class="w-75 d-flex justify-content-center align-items-center">
        <selection-type/>
      </div>
    </div>

    <div class="matches d-flex flex-row w-75 gap-2 justify-content-around align-items-center">
      <match-card v-for="player in matchers" :player="player" :match="match(player)"/>
    </div>

    <button class="btn btn-blue w-50 fs-4 mb-3"
            :class="{'invisible': !canEndRound}" @click="endRound" v-t="'cont'">
    </button>
  </div>
</template>

<script type="ts">
import Prompt from '@/components/gameShared/Prompt.vue';
import SelectionType from '@/components/gameShared/SelectionType.vue';
import MatchCard from '@/components/responseMatching/MatchCard.vue';
import DisputeIcon from '@/components/responseMatching/DisputeIcon.vue';
import ClickMp3 from '@/assets/audio/click2.mp3';
import {AudioWrap} from '@/mixins/audiowrap.ts';
import socket from '@/socket/socket';
import { useRoomStore } from '@/stores/room.ts';
import { useGameStore } from '@/stores/game.ts';
import { mapState } from 'pinia';
import { defineComponent } from "vue";

const click = new AudioWrap(ClickMp3);

export default defineComponent({
  components: {MatchCard, Prompt, SelectionType, DisputeIcon},
  data() {
    return {
      matchedResponse: '',
    }
  },
  computed: {
    ...mapState(useRoomStore, [
      'players'
    ]),
    ...mapState(useGameStore, [
      'prompt',
      'matches',
      'selectionType',
      'selectedResponse',
      'selector',
      'roundPoints',
      'canEndRound',
      'isSelector',
      'sikeDisputeCount'
    ]),
    matchers: function () {
      return this.players.filter(player => player.active && player.id !== this.selector.id);
    }
  },
  methods: {
    endRound: function () {
      click.play();
      socket.emit('selectionComplete');
    },
    match(player) {
      return this.matches.find(match => player.id === match.player.id);
    }
  }
});
</script>

<style lang="scss" scoped>

.matches {
  overflow-x: auto;
  flex-flow: wrap;
  overflow-y: auto;
  max-height: 25vh;
}
</style>