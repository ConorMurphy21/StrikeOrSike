<template>
  <div class="w-100 d-flex flex-column justify-content-between align-items-center py-3 px-4">
    <prompt :prompt="prompt"/>
    <response-list :selectable="false" :height="35"/>
    <div class="d-flex flex-column align-items-center w-100 gap-2">
      <input ref="resInput" type="text" maxlength="60" class="form-control w-75" autocomplete="off" enterkeyhint="send" v-model="response"
             @keyup.enter="sendResponse"/>
      <div class="d-flex align-items-center justify-content-between w-100">
        <vote-skip class="invisible" v-if="promptSkipping"/>
        <timer :time="timer"></timer>
        <vote-skip v-if="promptSkipping"/>
      </div>
    </div>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import ResponseList from '@/components/gameShared/ResponseList.vue';
import Timer from '@/components/gameShared/Timer.vue';
import VoteSkip from '@/components/promptResponse/VoteSkip.vue';
import Prompt from '@/components/gameShared/Prompt.vue';

const {mapState, mapGetters} = createNamespacedHelpers('game');

export default {
  data() {
    return {
      response: ''
    }
  },
  components: {
    ResponseList,
    Timer,
    VoteSkip,
    Prompt
  },
  mounted() {
    // only auto focus if the user is not on mobile
    if(!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.$refs.resInput.focus();
    }
  },
  computed: {
    ...mapState([
      'timer',
      'prompt',
    ]),
    ...mapGetters([
      'promptSkipping'
    ])
  },
  methods: {
    sendResponse() {
      if (this.response !== '') {
        this.$socket.emit('promptResponse', this.response);
        this.response = '';
      }
    }
  }
}
</script>



