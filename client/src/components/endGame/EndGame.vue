<template>
 <div class="w-100 d-flex flex-column justify-content-start align-items-center gap-2 my-3">
   <div v-for="(score, index) in scores">
     {{index + 1}}. {{score.player.name }} : {{$n(score.points)}}
   </div>

   <button class="btn btn-orange" @click="setScene('lobby')">Back to Lobby</button>
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

<style scoped>

</style>