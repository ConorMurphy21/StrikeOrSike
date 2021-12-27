<template>
  <div class="w-100 h-100 d-flex flex-column justify-content-between align-items-center p-3">
    <h1>{{ prompt }}</h1>
    <h3 v-t="{ path: 'passiveDisputeMessage', args: { response: selectedResponse } }"></h3>
  </div>
</template>

<script>
import {createNamespacedHelpers} from "vuex";

const {mapState} = createNamespacedHelpers('game');

export default {
  computed: {
    ...mapState([
      'prompt',
      'selectedResponse'
    ])
  }
}
</script>
