<template>
  <div class="w-100 h-100 d-flex align-items-center justify-content-start">
    <prompt :prompt="prompt"/>

    <h3 v-if="isSelector" class="m-5 score-message">
      {{ $t('selfScoreMessage', {score: $n(roundPoints)})}}
    </h3>
    <h3 v-else class="m-5 score-message">
      {{ $t('scoreMessage', {player: selector.name, score: $n(roundPoints)})}}
    </h3>
    <h2 class="selected-response">{{ selectedResponse }}</h2>

    <div v-for="row in rows()" class="d-flex flex-column">
      <div class="d-flex flex-row">
        <match-card v-for="player in row"/>
      </div>
    </div>

    <button class="btn btn-primary w-50 fs-4 m-5"
            :class="{'d-none': !canEndRound}" @click="endRound">Next Person
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
    ])
  },
  methods: {
    endRound: function () {
      this.$socket.emit('selectionComplete');
    },
    rows: function() {
      if(this.players.length < 5){
        return [this.players];
      } else {
        const med = Math.ceil(this.players.length/2);
        return [this.players.slice(0, med), this.players.slice(med)]
      }
    }
  }
}
</script>
