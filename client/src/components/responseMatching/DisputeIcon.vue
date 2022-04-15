<template>
  <button class="btn btn-orange text-white position-relative" :disabled="disabled"
          @click="sendVote" :class="{'btn-blue': !sikeDisputeNext}">
    <i class="bi-hand-thumbs-down fs-5"/>
    <span v-if="sikeDisputeCount" class="position-absolute top-0 start-100 translate-middle badge bg-burgundy">
      {{ $n(sikeDisputeCount) }}
    </span>
  </button>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import ClickMp3 from '@/assets/audio/click2.mp3';

const {mapGetters} = createNamespacedHelpers('game');

export default {
  props: {
    disabled: Boolean
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

