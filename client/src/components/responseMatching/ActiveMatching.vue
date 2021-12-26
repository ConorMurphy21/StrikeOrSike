<script setup>
import ResponseList from "@/components/gameShared/ResponseList.vue";
import SelectionType from "@/components/responseSelection/SelectionType.vue";
</script>

<template>
  <div class="w-100 h-100 d-flex flex-column justify-content-between align-items-center p-3">
    <h1>{{ prompt }}</h1>
    <button class="btn btn-primary w-50 fs-4" @click="noMatch">Sike!</button>
    <h3 v-t="{ path: 'activeMatchingMessage',
    args: { player: selector.name, selectionType, response: selectedResponse } }"></h3>
    <response-list :selectable="true" v-model="matchedResponse"/>
  </div>
</template>

<script>
import {createNamespacedHelpers} from "vuex";

const {mapState} = createNamespacedHelpers('game');

export default {
  data() {
    return {
      matchedResponse: '',
    }
  },
  computed: {
    ...mapState([
      'prompt',
      'selectionType',
      'selectedResponse',
      'selector'
    ])
  },
  watch: {
    matchedResponse: function (val) {
      this.$socket.emit("selectMatch", val);
    }
  },
  methods: {
    noMatch() {
      this.$socket.emit("selectMatch", '');
    }
  }
}
</script>
