<template>
  <h1>{{ prompt }}</h1>
  <ul>
    <li v-for="response in responses">
      {{response}}
    </li>
  </ul>
  <input type="text" v-model="response" v-on:keyup.enter="sendResponse"/>
</template>

<script>
import {createNamespacedHelpers} from "vuex";

const {mapState} = createNamespacedHelpers('game')

export default {
  data() {
    return {
      response: ''
    }
  },
  computed: {
    ...mapState([
      'timer',
      'prompt',
      'responses'
    ])
  },
  methods: {
    sendResponse(){
      this.$socket.emit("promptResponse", this.response);
      this.response = '';
    }
  }
}
</script>


