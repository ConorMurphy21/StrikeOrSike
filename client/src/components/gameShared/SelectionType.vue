<script setup lang="ts">
import { computed } from 'vue';
import StrikeImg from '@/assets/images/strike.png';
import SikeImg from '@/assets/images/sike.png';
import ChoiceImg from '@/assets/images/choice.png';
import { useGameStore } from '@/stores/game';
import { useI18n } from 'vue-i18n';

const gameStore = useGameStore();

defineProps({
  tooltip: {
    type: Boolean,
    default: true
  }
});

const typeImg = computed(() => {
  if (gameStore.selectionType === 'strike') {
    return StrikeImg;
  } else if (gameStore.selectionType === 'sike') {
    return SikeImg;
  }
  return ChoiceImg;
});

const { t } = useI18n();
</script>

<template>
  <img
    v-if="tooltip"
    v-tooltip.left.ds750="t('tooltip.' + gameStore.selectionType)"
    :src="typeImg"
    :alt="t(gameStore.selectionType)"
    :class="{ 'sike-img': gameStore.selectionType === 'sike' }" />
  <img
    v-else
    :src="typeImg"
    :alt="t(gameStore.selectionType)"
    :class="{ 'sike-img': gameStore.selectionType === 'sike' }" />
</template>

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
