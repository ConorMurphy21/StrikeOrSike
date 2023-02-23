<template>
  <div class="w-100 d-flex flex-column justify-content-between align-items-center py-3 px-4">
    <prompt :prompt="prompt"/>
    <response-list :selectable="false" :height="43"/>
    <button class="btn btn-orange w-75 w-lg-50 w-xl-25 fs-4 mb-3 position-relative"
            :class="{'btn-blue': !startNextRoundNext}"
         @click="sendVote">
      {{ hasNewPrompt ? $t('startNextRound') : $t('viewResults')}}

      <notification-count v-if='startNextRoundCount' class="position-absolute top-0 start-100 translate-middle fs-6">
        {{ $n(startNextRoundCount) }}
      </notification-count>
    </button>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import Prompt from '@/components/gameShared/Prompt.vue';
import ResponseList from '@/components/gameShared/ResponseList.vue';
import NotificationCount from '@/components/gameShared/NotificationCount.vue';
import ClickMp3 from '@/assets/audio/click2.mp3';

const {mapState, mapGetters} = createNamespacedHelpers('game');

export default {
  components: {
    Prompt,
    ResponseList,
    NotificationCount
  },
  computed: {
    ...mapState([
        'prompt',
        'hasNewPrompt'
    ]),
    ...mapGetters([
      'startNextRoundCount',
      'startNextRoundNext',
    ])
  },
  methods: {
    sendVote() {
      new Audio(ClickMp3).play();
      this.$socket.emit('pollVote', 'startNextRound');
    }
  }
}
</script>

