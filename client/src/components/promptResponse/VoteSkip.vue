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

const {mapState, mapGetters} = createNamespacedHelpers('game');

export default {
  computed: {
    ...mapState([
      'prompt'
    ]),
    ...mapGetters([
        'skipVoteCount'
    ])
  },
  methods: {
    sendVote() {
      this.$socket.emit('pollVote', 'skipPrompt');
    }
  }
}
</script>
