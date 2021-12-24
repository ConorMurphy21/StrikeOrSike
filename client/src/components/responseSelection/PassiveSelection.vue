<template>
  <div class="w-100 h-100 d-flex flex-column justify-content-between align-items-center p-3">
    <h1>{{ prompt }}</h1>
    <h3 v-t="{ path: 'passiveSelectionMessage', args: { player: selector.name, selectionType } }"></h3>
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
      'prompt',
      'selectionType',
      'selector'
    ])
  },
  methods: {}
}
</script>
