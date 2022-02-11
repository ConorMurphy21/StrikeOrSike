<template>
  <div class="w-100 h-100 d-flex flex-column justify-content-between align-items-center p-3">
    <prompt :prompt="prompt"/>
    <response-list :selectable="false"/>
    <button class="btn btn-blue w-25 fs-4 m-5"
         @click="sendVote">
      {{ $t('startNextRound') }} {{startNextRoundCount ? startNextRoundCount: ''}}
    </button>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import Prompt from '@/components/gameShared/Prompt.vue';
import ResponseList from '@/components/gameShared/ResponseList.vue';
import ClickMp3 from '@/assets/audio/click2.mp3';

const {mapState, mapGetters} = createNamespacedHelpers('game');

export default {
  components: {
    Prompt,
    ResponseList
  },
  computed: {
    ...mapState([
        'prompt'
    ]),
    ...mapGetters([
      'startNextRoundCount'
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

<style lang="scss" scoped>

</style>
