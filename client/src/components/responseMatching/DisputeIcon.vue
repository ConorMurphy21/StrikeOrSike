<template>
  <button class="btn btn-blue text-white position-relative" :disabled="disabled"
          data-bs-toggle="tooltip" :data-bs-placement="placement" :title="$t('tooltip.dispute', {response})"
     @click="sendVote">
    <i class="bi-hand-thumbs-down fs-5"/>
    <span v-if="sikeDisputeCount" class="position-absolute top-0 start-100 translate-middle badge bg-burgundy">
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
  props: {
    disabled: Boolean,
    response: String,
    placement: String
  },
  mounted() {
    //inti tooltip
    Array.from(document.querySelectorAll('button[data-bs-toggle="tooltip"]'))
        .forEach(tooltipNode => new Tooltip(tooltipNode, {delay: 500}))
  },
  computed: {
    ...mapGetters([
      'sikeDisputeCount'
    ]),
  },
  methods: {
    sendVote() {
      new Audio(ClickMp3).play();
      this.$socket.emit('pollVote', 'sikeDispute');
    }
  }
}
</script>

