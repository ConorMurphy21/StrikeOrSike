<template>
  <div class="w-100 d-flex flex-column justify-content-start align-items-center gap-3 py-3 px-4">
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
import { mapActions, mapState } from 'pinia';
import ClickMp3 from '@/assets/audio/click2.mp3'
import {AudioWrap} from '@/mixins/audiowrap';
import { useGameStore } from '@/stores/game.js';

const click = new AudioWrap(ClickMp3);


export default {
  computed: {
    ...mapState(useGameStore, [
      'scores'
    ]),
    rank() {
      let result = [];
      let lastScore = -1;
      let lastRank = 1;
      for (const [rank, score] of this.scores.entries()) {
        if (score.points < lastScore) {
          result.push(rank + 1);
          lastRank = rank + 1;
        } else {
          result.push(lastRank);
        }
        lastScore = score.points;
      }
      return result;
    }
  },
  methods: {
    ...mapActions(useGameStore, [
      'setScene'
    ]),
    toLobby() {
      click.play();
      this.setScene('lobby');
    }
  },
}
</script>