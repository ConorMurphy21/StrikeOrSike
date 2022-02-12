<template>
  <!-- desktop view -->
  <div class="d-md-flex d-none flex-row align-items-center justify-content-around w-75">
    <button v-if="choice && isSelector" class="btn btn-orange w-25"
            @click="selectSelectionType(true)">Strike
    </button>
    <selection-type/>
    <button v-if="choice && isSelector" class="btn btn-blue w-25"
            @click="selectSelectionType(false)">Sike
    </button>
  </div>
  <!-- mobile view -->
  <div class="d-md-none d-flex flex-column align-items-center w-75">
    <selection-type/>
    <div v-if="choice && isSelector" class="d-flex flex-row align-items-center justify-content-around gap-3 w-100">
      <button class="btn btn-orange w-50"
              @click="selectSelectionType(true)">Strike
      </button>
      <h3>or</h3>
      <button  class="btn btn-blue w-50"
              @click="selectSelectionType(false)">Sike
      </button>
    </div>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import SelectionType from '@/components/gameShared/SelectionType.vue';
import ClickMp3 from '@/assets/audio/click2.mp3'

const {mapState, mapGetters} = createNamespacedHelpers('game');


export default {
  data() {
    return {
      lastPicked: false
    }
  },
  components: {SelectionType},
  computed: {
    ...mapState({
      type: 'selectionType',
      choice: 'selectionTypeChoice'
    }),
    ...mapGetters([
      'isSelector'
    ]),
  },
  methods: {
    selectSelectionType(strike) {
      new Audio(ClickMp3).play();
      if (this.type === 'choice' || this.lastPicked !== strike) {
        this.$socket.emit('selectSelectionType', strike);
        this.lastPicked = strike;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
button {
  font-family: $main-font;
  font-size: 1.4rem;
}
</style>

