<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  width?: number;
  nextMajority?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  width: 24,
  nextMajority: false
});

const cssProps = computed<Record<string, string>>(() => {
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
