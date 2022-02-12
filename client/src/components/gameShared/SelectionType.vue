<template>
  <img :src="typeImg" :alt="$t(type)">
</template>

<script>
import {createNamespacedHelpers} from 'vuex';

const {mapState, mapGetters} = createNamespacedHelpers('game');
import StrikeImg from '@/assets/images/strike.png';
import SikeImg from '@/assets/images/sike.png';
import ChoiceImg from '@/assets/images/choice.png';

export default {
  computed: {
    ...mapState({
      type: 'selectionType',
    }),
    typeImg() {
      if (this.type === 'strike') {
        return StrikeImg;
      } else if (this.type === 'sike') {
        return SikeImg;
      }
      return ChoiceImg;
    }
  },
}
</script>

<style lang="scss" scoped>
img {
  min-width: 150px;
  max-width: 35%;
  color: $black;
  font-family: $header-font !important;
  font-weight: normal;
  font-size: 3rem;
  text-align: center;
}
</style>

