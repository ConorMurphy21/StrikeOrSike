<template>
  <img
    v-if="tooltip"
    v-tooltip.left.ds750="$t('tooltip.' + type)"
    :src="typeImg"
    :alt="$t(type)"
    :class="{ 'sike-img': type === 'sike' }" />
  <img v-else :src="typeImg" :alt="$t(type)" :class="{ 'sike-img': type === 'sike' }" />
</template>

<script lang="ts">
import StrikeImg from '@/assets/images/strike.png';
import SikeImg from '@/assets/images/sike.png';
import ChoiceImg from '@/assets/images/choice.png';
import { useGameStore } from '@/stores/game.js';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    tooltip: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    ...mapState(useGameStore, {
      type: 'selectionType'
    }),
    typeImg() {
      if (this.type === 'strike') {
        return StrikeImg;
      } else if (this.type === 'sike') {
        return SikeImg;
      }
      return ChoiceImg;
    }
  }
});
</script>

<style lang="scss" scoped>
img.sike-img {
  min-width: 96px;
  max-width: 22.5%;
}
img:not(.sike-img) {
  min-width: 150px;
  max-width: 35%;
}
img {
  color: $black;
  font-family: $header-font !important;
  font-weight: normal;
  font-size: 3rem;
  text-align: center;
}
</style>
