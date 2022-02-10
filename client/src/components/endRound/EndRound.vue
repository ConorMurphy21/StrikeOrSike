<template>
  <div class="btn btn-blue"
       @click="sendVote">
    <h3 v-if="startNextRoundCount"> {{ $n(startNextRoundCount) }} </h3>
    <h3 v-t="'startNextRound'"/>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import ClickMp3 from '@/assets/audio/click2.mp3';

const {mapState, mapGetters} = createNamespacedHelpers('game');

export default {
  computed: {
    ...mapGetters([
      'startNextRoundCount'
    ])
  },
  methods: {
    sendVote() {
      new Audio(ClickMp3).play();
      this.$socket.emit('pollVote', 'startNextRound');
    }
  }
}
</script>
