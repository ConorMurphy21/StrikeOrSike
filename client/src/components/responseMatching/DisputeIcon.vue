<template>
  <a class="btn btn-sm btn-orange text-white ratio-1x1 position-relative d-inline-flex justify-content-center align-items-center"
     :class="{'btn-blue': !sikeDisputeNext}"
     :disabled="disabled"
     v-tooltip="{title: $t('tooltip.dispute', {response}), placement}"
     @click="sendVote">
    <i class="bi-hand-thumbs-down fs-5 lh-sm"/>

    <notification-count :width="21" v-if="sikeDisputeCount" class="position-absolute top-0 start-100 translate-middle">
      {{ $n(sikeDisputeCount) }}
    </notification-count>
  </a>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import NotificationCount from '@/components/gameShared/NotificationCount.vue';
import ClickMp3 from '@/assets/audio/click2.mp3';
import {AudioWrap} from '@/mixins/audiowrap';

const {mapGetters, mapState} = createNamespacedHelpers('game');

export default {
  data() {
    return {
      tooltips: []
    }
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
    ...mapGetters([
      'sikeDisputeCount',
      'sikeDisputeNext'
    ])
  },
  methods: {
    sendVote() {
      new AudioWrap(ClickMp3).play();
      this.$socket.emit('pollVote', 'sikeDispute');
    }
  }
}
</script>
