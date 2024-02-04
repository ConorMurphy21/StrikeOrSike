<script setup lang="ts">
import Prompt from '@/components/gameShared/Prompt.vue';
import SelectionPicker from '@/components/responseSelection/SelectionPicker.vue';
import ResponseList from '@/components/gameShared/ResponseList.vue';
import { AudioWrap } from '@/mixins/audiowrap.js';
import AlertMp3 from '@/assets/audio/alert.mp3';
import { onMounted, ref, watch } from 'vue';
import socket from '@/socket/socket.js';
import { useGameStore } from '@/stores/game.js';

const alert = new AudioWrap(AlertMp3);

const response = ref('');

const gameStore = useGameStore();

onMounted(() => {
  if (gameStore.isSelector && !gameStore.firstSelection) {
    alert.play();
  }
});

watch(response, (val: string) => {
  socket.emit('selectResponse', val);
});
</script>

<template>
  <div class="w-100 d-flex flex-column justify-content-start align-items-center py-3 px-4">
    <prompt :prompt="gameStore.prompt" />
    <p
      v-if="!gameStore.isSelector"
      v-t="{ path: 'selection.message', args: { player: gameStore.selector?.name } }"
      class="display-6 passiveMessage mb-0" />
    <i18n-t v-else keypath="selection.selfMessage" tag="p" class="display-6 activeMessage mb-0">
      <template #self>
        <span v-t="'selection.self'" class="activeSelector display-6" />
      </template>
    </i18n-t>
    <selection-picker />
    <response-list
      v-model="response"
      :selectable="gameStore.isSelector && gameStore.selectionType !== 'choice'"
      :height="40" />
  </div>
</template>

<style lang="scss" scoped>
.activeMessage {
  font-weight: 500;
  text-align: center;
}

.passiveMessage {
  font-weight: 500;
  text-align: center;
}

.activeSelector {
  color: $red;
  font-weight: 900;
  padding-left: 1px;
  padding-right: 1px;
  text-decoration: 3px underline;
}
</style>
