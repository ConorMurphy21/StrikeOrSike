<template>
  <div class="btn btn-primary border border-primary border-2 rounded-circle
              d-flex flex-column justify-content-center align-items-center"
       @click="sendVote">
    <h3 class="text-white my-2" v-t="'skipPrompt'"/>
    <h3 v-if="skipVoteCount" class="text-white"> {{ $n(skipVoteCount) }} </h3>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import ClickMp3 from '@/assets/audio/click2.mp3';

const {mapGetters} = createNamespacedHelpers('game');

export default {
  computed: {
    ...mapGetters([
        'skipVoteCount'
    ])
  },
  methods: {
    sendVote() {
      new Audio(ClickMp3).play();
      this.$socket.emit('pollVote', 'skipPrompt');
    }
  }
}
</script>
