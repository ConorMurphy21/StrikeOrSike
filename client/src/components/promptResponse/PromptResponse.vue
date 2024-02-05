<script setup lang="ts">
import Timer from '@/components/gameShared/Timer.vue';
import ResponseList from '@/components/gameShared/ResponseList.vue';
import Prompt from '@/components/gameShared/Prompt.vue';
import { onMounted, type Ref, ref } from 'vue';
import socket from '@/socket/socket.js';
import { useGameStore } from '@/stores/game.js';

const response = ref('');
const resInput: Ref<null | HTMLInputElement> = ref(null);

const gameStore = useGameStore();

onMounted(() => {
  if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    resInput.value?.focus();
  }
});

function sendResponse() {
  if (response.value !== '') {
    socket.emit('promptResponse', response.value);
    response.value = '';
  }
}
</script>

<template>
  <div class="w-100 d-flex flex-column justify-content-between align-items-center py-3 px-4">
    <prompt :prompt="gameStore.prompt" :skippable="true" />
    <response-list :selectable="false" :height="45" />
    <div class="d-flex flex-column align-items-center w-100 gap-2">
      <input
        ref="resInput"
        v-model="response"
        type="text"
        maxlength="60"
        class="form-control w-75"
        autocomplete="off"
        enterkeyhint="send"
        @keyup.enter="sendResponse" />
      <timer :time="gameStore.timer" />
    </div>
  </div>
</template>
