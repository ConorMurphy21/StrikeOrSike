<script setup>
import ResponseList from '@/components/gameShared/ResponseList.vue';
import Timer from '@/components/gameShared/Timer.vue';
import VoteSkip from '@/components/promptResponse/VoteSkip.vue';
</script>

<template>
  <div class="w-100 h-100 d-flex flex-column justify-content-between align-items-center p-3">
    <h1 class="text-center">{{ prompt }}</h1>
    <vote-skip v-if="promptSkipping"></vote-skip>
    <response-list :selectable="false"/>
    <input ref="resInput" type="text" class="form-control w-75" v-model="response" @keyup.enter="sendResponse"/>
    <timer :time="timer"></timer>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';

const {mapState} = createNamespacedHelpers('game');

export default {
  data() {
    return {
      response: ''
    }
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

<style>
h1 {
  font-size: 2.75rem;
  font-weight: 650;
}
</style>


