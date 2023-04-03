<template>
  <a class="btn btn-sm btn-orange text-white ratio-1x1 position-relative d-inline-flex justify-content-center align-items-center"
          :class="{'btn-blue': !skipVoteNext}"
          data-bs-toggle="tooltip" data-bs-placement="left" :title="$t('tooltip.voteSkip')"
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
import {Tooltip} from 'bootstrap';
import {AudioWrap} from '@/mixins/AudioWrap';

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
  mounted() {
    //init tooltip
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    this.tooltips = [...tooltipTriggerList].map(tooltipTriggerEl => new Tooltip(tooltipTriggerEl,
        {delay: {show: 500, hide: 50}, trigger: 'hover'}));
  },
  beforeUnmount() {
    for(const tooltip of this.tooltips){
      tooltip.hide();
    }
  },
  methods: {
    sendVote() {
      new AudioWrap(ClickMp3).play();
      this.$socket.emit('pollVote', 'skipPrompt');
    }
  }
}
</script>
