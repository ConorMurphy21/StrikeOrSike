<template>
  <button
    class="btn btn-sm btn-orange text-white ratio-1x1 position-relative d-inline-flex justify-content-center align-items-center"
    :class="{'btn-blue': !sikeDisputeNext}"
    :disabled="disabled"
    v-tooltip="{title: $t('tooltip.dispute', {response}), placement}"
    @click="sendVote">
    <i class="bi-hand-thumbs-down fs-5 lh-sm" />

    <notification-count :width="21" v-if="sikeDisputeCount" class="position-absolute top-0 start-100 translate-middle">
      {{ $n(sikeDisputeCount) }}
    </notification-count>
  </button>
</template>

<script>
import NotificationCount from '@/components/gameShared/NotificationCount.vue';
import ClickMp3 from '@/assets/audio/click2.mp3';
import { AudioWrap } from '@/mixins/audiowrap';
import socket from '@/socket/socket';
import { useGameStore } from '@/stores/game.js';
import { mapState } from 'pinia';


export default {
  data() {
    return {
      tooltips: []
    };
  },
  components: {
    NotificationCount
  },
  props: {
    disabled: Boolean,
    response: String,
    placement: String
  },
  computed: {
    ...mapState(useGameStore, [
      'sikeDisputeCount',
      'sikeDisputeNext'
    ])
  },
  methods: {
    sendVote() {
      new AudioWrap(ClickMp3).play();
      socket.emit('pollVote', 'sikeDispute');
    }
  }
};
</script>

<style>
:focus:not(:focus-visible) {
  outline: 0;
  box-shadow: none;
}
</style>
