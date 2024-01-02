<template>
  <div class="w-100 d-flex flex-column justify-content-between align-items-center py-3 px-4">
    <prompt :prompt="prompt" />
    <response-list :selectable="false" :height="45" :player-id="responsesId" />
    <player-chooser class=" w-50 w-lg-25 fs-4 mb-3" v-model="selectedId" />
    <button class="btn btn-orange w-75 w-lg-50 w-xl-25 fs-4 mb-3 position-relative"
            :class="{'btn-blue': !startNextRoundNext}"
            @click="sendVote">
      {{ hasNextRound ? $t('startNextRound') : $t('viewResults') }}
      <notification-count v-if='startNextRoundCount' class="position-absolute top-0 start-100 translate-middle fs-6">
        {{ $n(startNextRoundCount) }}
      </notification-count>
    </button>
  </div>
</template>

<script>
import Prompt from '@/components/gameShared/Prompt.vue';
import ResponseList from '@/components/gameShared/ResponseList.vue';
import NotificationCount from '@/components/gameShared/NotificationCount.vue';
import ClickMp3 from '@/assets/audio/click2.mp3';
import PlayerChooser from '@/components/endRound/PlayerChooser.vue';
import { AudioWrap } from '@/mixins/audiowrap';
import socket from '@/socket/socket';
import { useGameStore } from '@/stores/game.js';
import { useRoomStore } from '@/stores/room.js';
import { mapState, mapActions } from 'pinia';


export default {
  data() {
    return {
      responsesId: '',
      selectedId: ''
    };
  },
  components: {
    PlayerChooser,
    Prompt,
    ResponseList,
    NotificationCount
  },
  computed: {
    ...mapState(useGameStore, [
      'prompt',
      'hasNextRound',
      'startNextRoundCount',
      'startNextRoundNext'
    ]),
    ...mapState(useRoomStore, [
      'self'
    ])
  },
  mounted() {
    this.selectedId = this.self.id;
  },
  methods: {
    sendVote() {
      new AudioWrap(ClickMp3).play();
      socket.emit('pollVote', 'startNextRound');
    },
    ...mapActions(useGameStore, [
      'getResponses'
    ])
  },
  watch: {
    selectedId(val) {
      if (val) {
        this.getResponses(val).then(() => {
          this.responsesId = val;
        });
      }
    }
  }
};
</script>

