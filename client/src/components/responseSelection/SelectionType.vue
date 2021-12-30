<template>

  <div class="d-flex flex-row align-items-center justify-content-around w-75">
    <button v-if="choice" class="btn btn-primary w-25" @click="selectSelectionType(true)">Strike</button>
    <h1>{{ type }}</h1>
    <button v-if="choice" class="btn btn-primary w-25" @click="selectSelectionType(false)">Sike</button>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';

const {mapState} = createNamespacedHelpers('game');

export default {
  computed: {
    ...mapState({
      type: 'selectionType',
      choice: 'selectionTypeChoice'
    })
  },
  methods: {
    selectSelectionType(strike) {
      this.$socket.emit('selectSelectionType', strike);
    }
  }
}
</script>

