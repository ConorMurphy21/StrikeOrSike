<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  width: {
    type: Number,
    default: 24
  },
  nextMajority: {
    type: Boolean,
    default: false
  }
});

const cssProps = computed((): Record<string, string> => {
  return {
    '--min-width': props.width + 'px'
  };
});
</script>

<template>
  <span
    :style="cssProps"
    class="rounded-pill badge d-inline-flex align-items-center justify-content-center p-0"
    :class="{ 'bg-burgundy': !nextMajority, 'bg-orange': nextMajority }">
    <slot />
  </span>
</template>

<style scoped lang="scss">
span {
  min-width: var(--min-width);
  height: var(--min-width);
}
</style>
