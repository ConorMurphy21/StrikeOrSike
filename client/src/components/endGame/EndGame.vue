<template>
  <div class="w-100 d-flex flex-column justify-content-start align-items-center gap-3">
    <h1 class="mt-2 text-center display-1" v-t="'playerScores'"/>

    <div class="list-group w-75 w-xl-50">
      <div v-for="(score, index) in scores" class="list-group-item">
        {{ $n(index + 1) }}. {{ score.player.name }}: {{ $n(score.points) }}
      </div>
    </div>

    <div class="flex-grow-1"/>
    <button class="btn btn-blue mb-5 w-50 w-lg-25" @click="click" v-t="'toLobby'"/>
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
  },
  methods: {
    ...mapMutations([
      'setScene'
    ]),
    click: function() {
      click.play();
      this.setScene('lobby');
    }
  }
}
</script>

<style lang="scss" scoped>

h1 {
  font-family: $header-font !important;
  font-weight: normal;
  color: $red;
}

.btn {
  width: 30%;
  min-width: 150px;
  height: 60px;
}
</style>