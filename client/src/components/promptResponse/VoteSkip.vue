<template>
  <button class="btn btn-orange ratio-1x1 text-white rounded-pill position-relative shadow border-dark"
          :class="{'btn-blue': !skipVoteNext}"
          data-bs-toggle="tooltip" data-bs-placement="left" :title="$t('tooltip.voteSkip')"
          @click="sendVote">
    <i class="bi-skip-end-fill display-6 p-0"/>
    <span v-if="skipVoteCount" class="position-absolute top-0 start-100 translate-40 badge bg-burgundy">
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
  data() {
    return {
      tooltips: []
    }
  },
  computed: {
    ...mapGetters([
      'skipVoteCount',
      'skipVoteNext'
    ])
  },
  mounted() {
    //init tooltip
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    this.tooltips = [...tooltipTriggerList].map(tooltipTriggerEl => new Tooltip(tooltipTriggerEl,
        {delay: {show: 500, hide: 50}}));
  },
  beforeUnmount() {
    for(const tooltip of this.tooltips){
      tooltip.hide();
    }
  },
  methods: {
    sendVote() {
      new Audio(ClickMp3).play();
      this.$socket.emit('pollVote', 'skipPrompt');
    }
  }
}
</script>
