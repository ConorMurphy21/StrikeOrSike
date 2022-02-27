<template>
  <div class="w-100 h-100 d-flex flex-column justify-content-between align-items-center p-3">
    <prompt :prompt="prompt"/>
    <response-list :selectable="false"/>
    <button class="btn btn-blue w-75 w-lg-50 w-xl-25 fs-4 m-5 position-relative"
         @click="sendVote">
      {{ $t('startNextRound') }}


      <span v-if="startNextRoundCount" class="position-absolute top-0 start-100 translate-middle badge bg-burgundy">
    {{ startNextRoundCount }}</span>
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
