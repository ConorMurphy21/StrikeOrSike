<template>
  <div class="d-flex flex-row align-items-center justify-content-around w-75">
    <button v-if="choice && isSelector" class="btn btn-primary w-25"
            @click="selectSelectionType(true)">Strike</button>
    <h1>{{ type }}</h1>
    <button v-if="choice && isSelector" class="btn btn-primary w-25"
            @click="selectSelectionType(false)">Sike</button>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';

const {mapState, mapGetters} = createNamespacedHelpers('game');

export default {
  data() {
    return {
      lastPicked: false
    }
  },
  computed: {
    ...mapState({
      type: 'selectionType',
      choice: 'selectionTypeChoice'
    }),
    ...mapGetters([
        'isSelector'
    ])
  },
  methods: {
    selectSelectionType(strike) {
      if (this.type === 'choice' || this.lastPicked !== strike) {
        this.$socket.emit('selectSelectionType', strike);
        this.lastPicked = strike;
      }
    }
  }
}
</script>

