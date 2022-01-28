<template>
  <div class="w-100 h-100 d-flex flex-column justify-content-between align-items-center p-3">
    <prompt :prompt="prompt"/>
    <vote-skip v-if="promptSkipping"></vote-skip>
    <response-list :selectable="false"/>
    <input ref="resInput" type="text" class="form-control w-75" v-model="response" @keyup.enter="sendResponse"/>
    <timer :time="timer"></timer>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import ResponseList from '@/components/gameShared/ResponseList.vue';
import Timer from '@/components/gameShared/Timer.vue';
import VoteSkip from '@/components/promptResponse/VoteSkip.vue';
import Prompt from '@/components/gameShared/Prompt.vue';

const {mapState} = createNamespacedHelpers('game');

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
    this.$refs.resInput.focus();
  },
  computed: {
    ...mapState([
      'timer',
      'prompt',
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



