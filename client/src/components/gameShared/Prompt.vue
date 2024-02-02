<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  prompt: {
    type: String,
    required: true
  },
  skippable: {
    type: Boolean,
    default: false
  }
});

const containsBlank = computed((): boolean => {
  return props.prompt.includes('_');
});
const left = computed((): string => {
  return props.prompt.substring(0, props.prompt.indexOf('_'));
});
const right = computed((): string => {
  return props.prompt.substring(props.prompt.lastIndexOf('_') + 1);
});
</script>

<template>
  <h1 v-if="containsBlank" class="display-5">
    {{ left }} <span class="blank" /> {{ right }} <vote-skip v-if="skippable" />
  </h1>
  <h1 v-else class="display-5">{{ prompt }} <vote-skip v-if="skippable" class="mb-2" /></h1>
</template>

<style lang="scss" scoped>
h1 {
  font-weight: 650;
  text-align: center;
  overflow-wrap: break-word;
  hyphens: auto;
}

.blank {
  width: 3.2em;
  border-bottom: 0.089em solid black;
  display: inline-block;
  border-radius: $border-radius;
}
</style>
