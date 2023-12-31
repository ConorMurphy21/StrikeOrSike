<template>
  <a class="btn btn-sm btn-orange text-white ratio-1x1 position-relative d-inline-flex justify-content-center align-items-center"
          :class="{'btn-blue': !skipVoteNext}"
          v-tooltip.right="$t('tooltip.voteSkip')"
          @click="sendVote">
    <i class="bi-hand-thumbs-down fs-3 p-0 lh-sm"/>

    <notification-count :width="22" v-if='skipVoteCount' class="position-absolute top-0 start-100 translate-middle fs-6">
      {{ $n(skipVoteCount) }}
    </notification-count>
  </a>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import ClickMp3 from '@/assets/audio/click2.mp3';
import NotificationCount from '@/components/gameShared/NotificationCount.vue';
import {AudioWrap} from '@/mixins/audiowrap';
import socket from '@/socket/socket';

const {mapGetters} = createNamespacedHelpers('game');

export default {
  data() {
    return {
      tooltips: []
    }
  },
  components: {
    NotificationCount
  },
  computed: {
    ...mapGetters([
      'skipVoteCount',
      'skipVoteNext'
    ])
  },
  methods: {
    sendVote() {
      new AudioWrap(ClickMp3).play();
      socket.emit('pollVote', 'skipPrompt');
    }
  }
}
</script>
