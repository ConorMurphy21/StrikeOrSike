<template>
  <div class="w-100 h-100 d-flex flex-column justify-content-start align-items-center gap-3">
    <h1 class="mt-2" v-t="'playerScores'"/>

    <div class="list-group w-50">
      <div v-for="(score, index) in scores" class="list-group-item">
        {{ $n(index + 1) }}. {{ score.player.name }}: {{ $n(score.points) }}
      </div>
    </div>

    <div class="flex-grow-1"/>
    <button class="btn btn-blue mb-5" @click="setScene('lobby')">Back to Lobby</button>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';

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
    ])
  }
}
</script>

<style lang="scss" scoped>

h1 {
  font-family: $header-font !important;
  font-size: 4rem;
  font-weight: normal;
  color: $red;
}

.btn {
  width: 30%;
  min-width: 150px;
  height: 60px;
}
</style>