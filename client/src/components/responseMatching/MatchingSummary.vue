<template>
  <div class="list-group w-100 h-100 align-items-center">
    <h3 class="m-5"> {{ roundPoints }} </h3>
    <div class="list-group w-75 h-100">
      <div v-for="match in matches"
           class="list-group-item">
        {{ match.player.name }}: {{ match.response ? 'Strike!' : 'Sike!'}}
      </div>
    </div>
    <button class="btn btn-primary w-50 fs-4 m-5"
            :class="{'d-none': !canEndRound}" @click="endRound">Next Person
    </button>
  </div>
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

