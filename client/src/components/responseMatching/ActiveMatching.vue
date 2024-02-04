<script setup lang="ts">
import Prompt from '@/components/gameShared/Prompt.vue';
import DisputeIcon from '@/components/responseMatching/DisputeIcon.vue';
import ResponseList from '@/components/gameShared/ResponseList.vue';
import { AudioWrap } from '@/mixins/audiowrap.js';
import ClickMp3 from '@/assets/audio/click2.mp3';
import AlertMp3 from '@/assets/audio/alert.mp3';
import { onMounted, ref, watch } from 'vue';
import socket from '@/socket/socket.js';
import { useGameStore } from '@/stores/game.js';
import { useI18n } from 'vue-i18n';

const click = new AudioWrap(ClickMp3);
const alert = new AudioWrap(AlertMp3);

const matchedResponse = ref('');

const gameStore = useGameStore();

onMounted(() => {
  if (!gameStore.unmatched) {
    alert.play();
  }
});

watch(matchedResponse, (val: string): void => {
  socket.emit('selectMatch', val);
});

function noMatch() {
  click.play();
  socket.emit('selectMatch', '');
}

const { t } = useI18n();
</script>

<template>
  <div class="w-100 d-flex flex-column justify-content-start align-items-center py-3 px-4">
    <prompt :prompt="gameStore.prompt" />
    <i18n-t keypath="activeMatchingMessage" tag="p">
      <template #player>
        <span class="player">{{ gameStore.selector?.name }}</span>
      </template>
      <template #response>
        <span class="responseMessage fs-4">{{ gameStore.selectedResponse }}</span>
        <dispute-icon
          v-if="gameStore.sikeDispute && gameStore.selectionType === 'sike'"
          class="ms-2 me-1"
          :response="gameStore.selectedResponse"
          :placement="'top'" />
      </template>
      <template #type>
        <span v-t="gameStore.selectionType" :class="gameStore.selectionType" />
      </template>
    </i18n-t>

    <button
      v-tooltip.left.ds900="$t('tooltip.noMatch', { response: gameStore.selectedResponse })"
      class="btn btn-primary w-50 fs-4 d-flex justify-content-center align-items-center"
      @click="noMatch">
      <div class="d-flex justify-content-center align-items-center w-75">
        <img class="my-auto w-75 w-sm-50 w-lg-25" src="@/assets/images/sike.png" :alt="t('sike')" />
      </div>
    </button>
    or
    <response-list v-model="matchedResponse" :selectable="true" :height="40" />
  </div>
</template>

<style lang="scss" scoped>
p {
  text-align: center;
}

.responseMessage {
  text-align: center;
  font-weight: 900;
  color: $red;
}

.strike {
  color: $orange;
}

.sike {
  color: $blue;
}
</style>
