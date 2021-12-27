<script setup>
import ResponseList from "@/components/gameShared/ResponseList.vue";
import Timer from "@/components/gameShared/Timer.vue";
</script>

<template>
  <div class="w-100 h-100 d-flex flex-column justify-content-between align-items-center p-3">
    <h1>{{ prompt }}</h1>
    <response-list :selectable="false"/>
    <input type="text" class="form-control w-75" v-model="response" @keyup.enter="sendResponse" autofocus/>
    <timer :time="timer"></timer>
  </div>
</template>

<script>
import {createNamespacedHelpers} from "vuex";

const {mapState} = createNamespacedHelpers('game');

export default {
  data() {
    return {
      response: ''
    }
  },
  computed: {
    ...mapState([
      'timer',
      'prompt'
    ])
  },
  methods: {
    sendResponse() {
      if(this.response !== '') {
        this.$socket.emit("promptResponse", this.response);
        this.response = '';
      }
    }
  }
}
</script>


