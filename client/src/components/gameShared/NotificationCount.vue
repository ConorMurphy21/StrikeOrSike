<template>
  <span
    :style="cssProps"
    class="rounded-pill badge bg-orange d-inline-flex align-items-center justify-content-center p-0"
    :class="{ 'bg-blue': !nextMajority }">
    <slot />
    {{ nextMajority }}
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    width: {
      type: Number,
      default: 24
    },
    nextMajority: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    cssProps() {
      return {
        '--min-width': this.width + 'px'
      }
    }
  }
})
</script>

<style scoped lang="scss">
span {
  min-width: var(--min-width);
  height: var(--min-width);
}
</style>
