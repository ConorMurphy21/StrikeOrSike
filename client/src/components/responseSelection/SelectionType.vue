<template>
  <div class="d-flex flex-row align-items-center justify-content-around w-75">
    <button v-if="choice && isSelector" class="btn btn-red w-25"
            @click="selectSelectionType(true)">Strike</button>
    <img :src="typeImg" :alt="$t(type)">
    <button v-if="choice && isSelector" class="btn btn-blue w-25"
            @click="selectSelectionType(false)">Sike</button>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';

const {mapState, mapGetters} = createNamespacedHelpers('game');
import StrikeImg from '@/assets/strike.png';
import SikeImg from '@/assets/sike.png';
import ChoiceImg from '@/assets/choice.png';

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
    ]),
    typeImg(){
      if(this.type === 'strike'){
        return StrikeImg;
      } else if(this.type === 'sike'){
        return SikeImg;
      }
      return ChoiceImg;
    }

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

<style lang="scss" scoped>
button{
  font-family: $main-font;
  font-size: 1.4rem;
}
img{
  max-width: 35%;
  color: $black;
  font-family: $header-font !important;
  font-weight: normal;
  font-size: 3rem;
  text-align: center;
}
</style>

