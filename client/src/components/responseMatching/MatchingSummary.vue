<template>
  <h3> {{roundPoints}} </h3>
  <div class="list-group w-100 h-100">
    <div v-for="match in matches"
         class="list-group-item">
      {{ match.player.name }}: {{match.response}}
    </div>
  </div>
  <button class="btn btn-primary w-50 fs-4"
          :class="{'d-none': !canEndRound}" @click="endRound">Next Person
  </button>
</template>

<script>
import {createNamespacedHelpers} from "vuex";

const {mapState, mapGetters} = createNamespacedHelpers('game');

export default {
  data() {
    return {
      matchedResponse: '',
    }
  },
  computed: {
    ...mapState([
      'matches',
      'selectionType'
    ]),
    ...mapGetters([
      'roundPoints',
      'canEndRound'
    ])
  },
  methods: {
    endRound: function () {
      this.$socket.emit("selectionComplete");
    }
  }
}
</script>

