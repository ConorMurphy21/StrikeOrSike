<script setup lang="ts">
import { ref } from 'vue';
import { AudioWrap } from '@/mixins/audiowrap.js';
import ClickMp3 from '@/assets/audio/click2.mp3';
import socket from '@/socket/socket.js';
import { useI18n } from 'vue-i18n';
import { useGameStore } from '@/stores/game';

const pressedVote = ref(false);

const gameStore = useGameStore();
function sendVote() {
  pressedVote.value = !pressedVote.value;
  new AudioWrap(ClickMp3).play();
  socket.emit('pollVote', 'skipPrompt');
}

const { n } = useI18n();
</script>

<template>
  <a
    v-tooltip.right="$t('tooltip.voteSkip')"
    class="btn btn-sm btn-blue ratio-1x1 position-relative d-inline-flex justify-content-center align-items-center"
    :class="{
      'text-white shadow': !pressedVote,
      'text-white-50 shadow-none': pressedVote
    }"
    @click="sendVote">
    <i class="bi-hand-thumbs-down fs-3 p-0 lh-sm" />
    <notification-count
      v-if="gameStore.skipVoteCount"
      :width="22"
      class="position-absolute top-0 start-100 translate-middle fs-6"
      :next-majority="gameStore.skipVoteNext">
      {{ n(gameStore.skipVoteCount) }}
    </notification-count>
  </a>
</template>
