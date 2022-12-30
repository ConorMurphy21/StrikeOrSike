<template>
  <button class="btn btn-orange text-white position-relative" :class="{'btn-blue': !sikeDisputeNext}"
          :disabled="disabled"
          data-bs-toggle="tooltip" :data-bs-placement="placement" :title="$t('tooltip.dispute', {response})"
          @click="sendVote">
    <i class="bi-hand-thumbs-down fs-5"/>
    <span v-if="sikeDisputeCount"
          class="position-absolute top-0 start-100 translate-middle rounded-pill badge bg-burgundy">
      {{ $n(sikeDisputeCount) }}
    </span>
  </button>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import ClickMp3 from '@/assets/audio/click2.mp3';
import {Tooltip} from 'bootstrap';

const {mapGetters, mapState} = createNamespacedHelpers('game');

export default {
  data() {
    return {
      tooltips: []
    }
  },
  props: {
    disabled: Boolean,
    response: String,
    placement: String
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
  computed: {
    ...mapGetters([
      'sikeDisputeCount',
      'sikeDisputeNext'
    ])
  },
  methods: {
    sendVote() {
      new Audio(ClickMp3).play();
      this.$socket.emit('pollVote', 'sikeDispute');
    }
  }
}
</script>

