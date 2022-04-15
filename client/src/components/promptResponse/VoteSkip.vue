<template>
  <button class="btn btn-orange text-white position-relative"
          :class="{'btn-blue': !skipVoteNext}"
          @click="sendVote">
    <i class="bi-skip-end display-6"/>
    <span v-if="skipVoteCount" class="position-absolute top-0 start-100 translate-middle badge bg-burgundy">
      {{ $n(skipVoteCount) }}
    </span>
  </button>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import ClickMp3 from '@/assets/audio/click2.mp3';

const {mapGetters} = createNamespacedHelpers('game');

export default {
  computed: {
    ...mapGetters([
      'skipVoteCount',
      'skipVoteNext'
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
