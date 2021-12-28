<template>
  <div class="w-100 h-100 d-flex flex-column justify-content-between align-items-center p-3">
    <h1>{{ prompt }}</h1>
    <h3 v-t="{ path: 'activeDisputeMessage', args: { response: selectedResponse } }"></h3>
    <div class="w-100 d-flex flex-row justify-content-between align-items-center p-3">
      <button class="btn btn-primary w-25" @click="vote(true)">yes</button>
      <button class="btn btn-secondary w-25" @click="vote(false)">no</button>
    </div>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';

const {mapState} = createNamespacedHelpers('game');

export default {
  computed: {
    ...mapState([
      'prompt',
      'selectedResponse'
    ])
  },
  methods: {
    vote(upvote) {
      this.$socket.emit('sikeVote', upvote);
    }
  }
}
</script>