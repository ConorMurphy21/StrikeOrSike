<template>
  <div class="d-flex flex-row align-items-center justify-content-around w-75">
    <button v-if="choice && isSelector" class="btn btn-orange w-25"
            @click="selectSelectionType(true)">Strike</button>
    <selection-type/>
    <button v-if="choice && isSelector" class="btn btn-blue w-25"
            @click="selectSelectionType(false)">Sike</button>
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
button{
  font-family: $main-font;
  font-size: 1.4rem;
}
</style>

