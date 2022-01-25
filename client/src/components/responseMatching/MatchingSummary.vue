<template>
  <div class="w-100 h-100 d-flex flex-column align-items-center justify-content-between gap-2 my-3">


    <div class="d-flex flex-column align-items-center justify-content-start">
      <prompt :prompt="prompt"/>
      <h3 v-if="isSelector" class="score-message">
        {{ $t('selfScoreMessage', {score: $n(roundPoints)}) }}
      </h3>
      <h3 v-else class="score-message">
        {{ $t('scoreMessage', {player: selector.name, score: $n(roundPoints)}) }}
      </h3>
      <h2 class="selected-response">{{ selectedResponse }}</h2>
    </div>

    <div class="d-flex flex-column w-75 gap-2">
      <div v-for="row in rows()" class="d-flex flex-row gap-2 justify-content-evenly align-items-center w-100">
        <match-card v-for="player in row" :player="player" :match="match(player)"/>
      </div>
    </div>


    <button class="btn btn-blue w-50 fs-4 m-5"
            :class="{'invisible': !canEndRound}" @click="endRound" v-t="'continue'">
    </button>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import Prompt from '@/components/gameShared/Prompt.vue';
import MatchCard from '@/components/responseMatching/MatchCard.vue'

const game = createNamespacedHelpers('game');
const room = createNamespacedHelpers('room');

export default {
  components: {MatchCard, Prompt},
  data() {
    return {
      matchedResponse: '',
    }
  },
  computed: {
    ...room.mapState([
      'players'
    ]),
    ...game.mapState([
      'prompt',
      'matches',
      'selectionType',
      'selectedResponse',
      'selector'
    ]),
    ...game.mapGetters([
      'roundPoints',
      'canEndRound',
      'isSelector'
    ]),

  },
  methods: {
    endRound: function () {
      this.$socket.emit('selectionComplete');
    },
    rows: function () {
      const matchers = this.players.filter(player => player.id !== this.selector.id);
      if (matchers.length < 5) {
        return [matchers];
      } else {
        const med = Math.ceil(this.players.length / 2);
        return [matchers.slice(0, med), matchers.slice(med)];
      }
    },
    match(player) {
      return this.matches.find(match => player.id === match.player.id);
    }
  }
}
</script>

<style lang="scss" scoped>
h3{
  font: inherit;
  font-size: 1.4rem;
}
h2{
  font: inherit;
  font-size: 1.8rem;
  color: $red;
  font-weight: 900;

}
</style>