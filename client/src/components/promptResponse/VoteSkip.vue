<template>
  <div class="btn btn-primary border border-primary border-2 rounded-circle
              d-flex flex-column justify-content-center align-items-center py-2"
       @click="sendVote">
    <h3 v-if="skipVoteCount" class="text-white"> {{ $n(skipVoteCount) }} </h3>
    <h3 class="text-white" v-t="'skipPrompt'"/>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';

const {mapState} = createNamespacedHelpers('game');

export default {
  data() {
    return {
      voted: false
    }
  },
  computed: {
    ...mapState([
      'skipVoteCount',
      'prompt'
    ])
  },
  methods: {
    sendVote() {
      this.voted = !this.voted;
      this.$socket.emit('voteSkipPrompt', this.voted);
    }
  },
  watch: {
    // whenever the prompt changes the votes should be reset
    prompt() {
      this.voted = false;
    }
  }
}
</script>
