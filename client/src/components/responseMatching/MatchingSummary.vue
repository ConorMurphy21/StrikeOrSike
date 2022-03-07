<template>
  <div class="w-100 d-flex flex-column align-items-center justify-content-between gap-2">


    <div class="d-flex flex-column align-items-center justify-content-start">
      <prompt :prompt="prompt"/>
      <h3 v-if="isSelector" class="fs-3">
        {{ $t('selfScoreMessage', {score: $n(roundPoints)}) }}
      </h3>
      <h3 v-else class="fs-3">
        {{ $t('scoreMessage', {player: selector.name, score: $n(roundPoints)}) }}
      </h3>
      <h2 class="fs-2 fw-bolder">{{ selectedResponse }}</h2>
      <selection-type/>
    </div>

    <div class="matches d-flex flex-row w-75 gap-2 justify-content-around align-items-center">
      <match-card v-for="player in matchers" :player="player" :match="match(player)"/>
    </div>
<!--    <div class="d-flex flex-column w-75 gap-2">-->
<!--      <div v-for="row in rows()" class="d-flex flex-row gap-2 justify-content-evenly align-items-center w-100">-->
<!--        <match-card v-for="player in row" :player="player" :match="match(player)"/>-->
<!--      </div>-->
<!--    </div>-->


    <button class="btn btn-blue w-50 fs-4 mb-3"
            :class="{'invisible': !canEndRound}" @click="endRound" v-t="'continue'">
    </button>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import Prompt from '@/components/gameShared/Prompt.vue';
import SelectionType from '@/components/gameShared/SelectionType.vue';
import MatchCard from '@/components/responseMatching/MatchCard.vue';
import ClickMp3 from '@/assets/audio/click2.mp3';

const click = new Audio(ClickMp3);

const game = createNamespacedHelpers('game');
const room = createNamespacedHelpers('room');

export default {
  components: {MatchCard, Prompt, SelectionType},
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
    matchers: function() {
      return this.players.filter(player => player.active && player.id !== this.selector.id);
    }
  },
  methods: {
    endRound: function () {
      click.play();
      this.$socket.emit('selectionComplete');
    },
    rows: function () {
      const matchers = this.players.filter(player => player.active && player.id !== this.selector.id);
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

h2{
  color: $red;
}

.matches{
  overflow-x: auto;
  flex-flow: wrap;
  overflow-y: auto;
  max-height: 25vh;
}
</style>