<template>
  <button class="btn btn-primary text-white
              d-flex flex-column justify-content-center align-items-center position-relative"
       @click="sendVote">
    <i class="bi-skip-end display-6"></i>
    <span v-if="skipVoteCount" class="position-absolute top-0 start-100 translate-middle badge bg-blue">
    {{ $n(skipVoteCount) }}</span>
  </button>
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
