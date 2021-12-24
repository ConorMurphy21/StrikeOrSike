<script setup>
import ResponseList from "@/components/gameShared/ResponseList.vue";
import SelectionType from "@/components/selection/SelectionType.vue";
</script>

<template>
  <div class="w-100 h-100 d-flex flex-column justify-content-between align-items-center p-3">
    <h1>{{ prompt }}</h1>
    <selection-type/>
    <response-list :selectable="true" v-model="response"/>
  </div>
</template>

<!--suppress JSUnusedGlobalSymbols -->
<script>
import {createNamespacedHelpers} from "vuex";

const {mapState} = createNamespacedHelpers('game');

export default {
  data() {
    return {
      response: '',
    }
  },
  computed: {
    ...mapState([
      'prompt',
    ])
  },
  watch:{
    response: function (val) {
      this.$socket.emit("selectResponse", val);
    }
  }
}
</script>
