<script setup lang="ts">
import SelectionType from '@/components/gameShared/SelectionType.vue';
import { computed, ref } from 'vue';
import { AudioWrap } from '@/mixins/audiowrap.js';
import ClickMp3 from '@/assets/audio/click2.mp3';
import socket from '@/socket/socket.js';
import { useGameStore } from '@/stores/game.js';
import { useI18n } from 'vue-i18n';

const lastPicked = ref(false);

const gameStore = useGameStore();

const isSelectingChoice = computed<boolean>(() => {
  return gameStore.selectionTypeChoice && gameStore.isSelector;
});

function selectSelectionType(strike: boolean) {
  new AudioWrap(ClickMp3).play();
  if (gameStore.selectionType === 'choice' || lastPicked.value !== strike) {
    socket.emit('selectSelectionType', strike);
    lastPicked.value = strike;
  }
}

const { t } = useI18n();
</script>
<template>
  <!-- desktop view -->
  <div
    class="d-md-flex d-none flex-row align-items-center justify-content-center w-75"
    :class="{ 'justify-content-between': isSelectingChoice }">
    <button
      v-if="isSelectingChoice"
      v-tooltip.left.ds750="t('tooltip.strike')"
      v-t="'strike'"
      class="btn btn-orange w-25"
      @click="selectSelectionType(true)" />
    <selection-type :tooltip="!isSelectingChoice" />
    <button
      v-if="isSelectingChoice"
      v-tooltip.right.ds750="t('tooltip.sike')"
      v-t="'sike'"
      class="btn btn-blue w-25"
      @click="selectSelectionType(false)" />
  </div>
  <!-- mobile view -->
  <div class="d-md-none d-flex flex-column align-items-center w-75">
    <selection-type />
    <div v-if="isSelectingChoice" class="d-flex flex-row align-items-center justify-content-around gap-3 w-100">
      <button
        v-tooltip.left.ds750="t('tooltip.strike')"
        v-t="'strike'"
        class="btn btn-orange w-50"
        @click="selectSelectionType(true)" />
      <h3 v-t="'or'" />
      <button
        v-tooltip.right.ds750="t('tooltip.sike')"
        v-t="'sike'"
        class="btn btn-blue w-50"
        @click="selectSelectionType(false)" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
button {
  font-size: 1.4rem;
}
</style>
