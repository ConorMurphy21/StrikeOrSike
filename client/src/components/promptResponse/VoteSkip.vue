<template>
  <button class="btn btn-orange text-white position-relative"
          data-bs-toggle="tooltip" data-bs-placement="top" :title="$t('tooltip.voteSkip')"
          @click="sendVote">
    <i class="bi-skip-end display-6"/>
    <span v-if="skipVoteCount" class="position-absolute top-0 start-100 translate-middle badge bg-blue">
      {{ $n(skipVoteCount) }}
    </span>
  </button>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import ClickMp3 from '@/assets/audio/click2.mp3';
import {Tooltip} from 'bootstrap';

const {mapGetters} = createNamespacedHelpers('game');

export default {
  computed: {
    ...mapGetters([
      'skipVoteCount'
    ])
  },
  mounted() {
    //inti tooltip
    Array.from(document.querySelectorAll('button[data-bs-toggle="tooltip"]'))
        .forEach(tooltipNode => new Tooltip(tooltipNode, {delay: 500}))
  },
  methods: {
    sendVote() {
      new Audio(ClickMp3).play();
      this.$socket.emit('pollVote', 'skipPrompt');
    }
  }
}
</script>
