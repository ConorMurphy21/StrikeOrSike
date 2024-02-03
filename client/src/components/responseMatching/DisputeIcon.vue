<script setup lang="ts">
import NotificationCount from '@/components/gameShared/NotificationCount.vue';
import { ref } from 'vue';
import { AudioWrap } from '@/mixins/audiowrap.js';
import ClickMp3 from '@/assets/audio/click2.mp3';
import socket from '@/socket/socket.js';
import { useI18n } from 'vue-i18n';
import { useGameStore } from '@/stores/game.js';

defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  response: {
    type: String,
    required: true
  },
  placement: {
    type: String,
    required: true
  }
});

const pressedVote = ref(false);

const gameStore = useGameStore();

function sendVote() {
  pressedVote.value = !pressedVote.value;
  new AudioWrap(ClickMp3).play();
  socket.emit('pollVote', 'sikeDispute');
}

const { t, n } = useI18n();
</script>

<template>
  <button
    v-tooltip="{ title: t('tooltip.dispute', { response }), placement }"
    class="btn btn-sm btn-blue ratio-1x1 position-relative d-inline-flex justify-content-center align-items-center"
    :class="{
      'text-white shadow': !pressedVote,
      'text-white-50 shadow-none': pressedVote
    }"
    :disabled="disabled"
    @click="sendVote">
    <i class="bi-hand-thumbs-down fs-5 lh-sm" />
    <notification-count
      v-if="gameStore.sikeDisputeCount"
      :width="22"
      class="position-absolute top-0 start-100 translate-middle"
      :next-majority="gameStore.sikeDisputeNext">
      {{ n(gameStore.sikeDisputeCount) }}
    </notification-count>
  </button>
</template>

<style>
:focus:not(:focus-visible) {
  outline: 0;
  box-shadow: none;
}
</style>
