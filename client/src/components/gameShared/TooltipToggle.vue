<script setup lang="ts">
import { getCurrentInstance } from 'vue';
import { useSettingsStore } from '@/stores/settings.js';

const settingsStore = useSettingsStore();
const instance = getCurrentInstance();
function click() {
  settingsStore.setShowTooltips(!settingsStore.showTooltips);
  instance?.proxy?.$forceUpdate();
}
</script>

<template>
  <button
    v-tooltip.left.ds250="$t('tooltip.showTooltips')"
    class="text-black"
    :class="{ 'bi-lightbulb': settingsStore.showTooltips, 'bi-lightbulb-off': !settingsStore.showTooltips }"
    @click="click" />
</template>

<style scoped lang="scss">
button {
  font-size: 40px;
  background: none;
  border: none;
  outline: none;
}

button:hover {
  text-shadow: 0 0 18px yellow;
  cursor: pointer;
}

button:focus {
  text-shadow: 0 0 18px yellow;
  cursor: pointer;
}
</style>
