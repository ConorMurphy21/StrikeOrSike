<template>
  <div class="w-100 d-flex flex-column justify-content-start align-items-center gap-3">
    <h1 class="mt-2 text-center display-1 text-red font-fancy" v-t="'playerScores'"/>

    <div class="list-group w-75 w-xl-50">
      <div v-for="(score, index) in scores" class="list-group-item">
        {{ rank[index] }}. {{ score.player.name }}: {{ $n(score.points) }}
      </div>
    </div>

    <div class="flex-grow-1"/>
    <button class="btn btn-blue w-75 w-lg-50 fs-4 mb-4" @click="toLobby" v-t="'toLobby'"/>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import ClickMp3 from '@/assets/audio/click2.mp3'

const click = new Audio(ClickMp3);

const {mapState, mapMutations} = createNamespacedHelpers('game')

export default {
  computed: {
    ...mapState([
      'scores'
    ]),
    rank() {
      let result = [];
      let rank = 1;
      let last = -1;
      for (let score of this.scores) {
        if (score.points < last) rank++;
        result.push(rank);
        last = score.points;
      }
      return result;
    }
  },
  methods: {
    ...mapMutations([
      'setScene'
    ]),
    toLobby() {
      click.play();
      this.setScene('lobby');
    }
  },
}
</script>