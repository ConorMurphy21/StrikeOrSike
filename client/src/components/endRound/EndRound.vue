<template>
  <div class="w-100 d-flex flex-column justify-content-between align-items-center py-3 px-4">
    <prompt :prompt="prompt"/>
    <response-list :selectable="false" :height="43" :player-id="responsesId"/>
    <player-chooser class="mb-2" v-model="selectedId"/>
    <button class="btn btn-orange w-75 w-lg-50 w-xl-25 fs-4 mb-3 position-relative"
            :class="{'btn-blue': !startNextRoundNext}"
         @click="sendVote">
      {{ hasNextRound ? $t('startNextRound') : $t('viewResults')}}
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
import PlayerChooser from '@/components/endRound/PlayerChooser.vue';

const {mapState, mapGetters, mapActions} = createNamespacedHelpers('game');

export default {
  data(){
    return {
      responsesId: '',
      selectedId: ''
    }
  },
  components: {
    PlayerChooser,
    Prompt,
    ResponseList,
    NotificationCount
  },
  computed: {
    ...mapState([
        'prompt',
        'hasNextRound'
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
    },
    ...mapActions([
        'getResponses'
    ])
  },
  watch: {
    selectedId(val) {
      if(val) {
        this.getResponses(val).then(() => {
          this.responsesId = val;
        });
      }
    }
  }
}
</script>

