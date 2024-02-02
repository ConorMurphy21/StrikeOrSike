<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { AudioWrap } from '@/mixins/audiowrap.js';
import ClickMp3 from '@/assets/audio/click2.mp3';
import socket from '@/socket/socket.js';
import { useRoomStore } from '@/stores/room.js';
import { useGameStore } from '@/stores/game.js';
import NotificationCount from '@/components/gameShared/NotificationCount.vue';
import PlayerChooser from '@/components/endRound/PlayerChooser.vue';
import ResponseList from '@/components/gameShared/ResponseList.vue';
import Prompt from '@/components/gameShared/Prompt.vue';
import { useI18n } from 'vue-i18n';

const roomStore = useRoomStore();
const gameStore = useGameStore();

const responsesId = ref('');
const selectedId = ref('');
const pressedVote = ref(false);

watch(selectedId, async (val: string) => {
  if (val) {
    await gameStore.getResponses(val).then(() => {
      responsesId.value = val;
    });
  }
});

onMounted(() => {
  selectedId.value = roomStore.self!.id;
});

function sendVote() {
  new AudioWrap(ClickMp3).play();
  pressedVote.value = !pressedVote.value;
  socket.emit('pollVote', 'startNextRound');
}

const { t, n } = useI18n();
</script>

<template>
  <div class="w-100 d-flex flex-column justify-content-between align-items-center py-3 px-4">
    <prompt :prompt="gameStore.prompt" />
    <response-list :selectable="false" :height="45" :player-id="responsesId" />
    <player-chooser v-model="selectedId" class="w-50 w-lg-25 fs-4 mb-3" />
    <button
      class="btn btn-blue w-75 w-lg-50 w-xl-25 fs-4 mb-3 position-relative"
      :class="{
        'text-white shadow': !pressedVote,
        'text-white-50 shadow-none': pressedVote
      }"
      @click="sendVote">
      {{ gameStore.hasNextRound ? t('startNextRound') : t('viewResults') }}
      <notification-count
        v-if="gameStore.startNextRoundCount"
        class="position-absolute top-0 start-100 translate-middle fs-6"
        :next-majority="gameStore.startNextRoundNext">
        {{ n(gameStore.startNextRoundCount) }}
      </notification-count>
    </button>
  </div>
</template>
