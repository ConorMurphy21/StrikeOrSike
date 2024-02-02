<script setup lang="ts">
import Lobby from '@/components/lobby/Lobby.vue';
import Countdown from '@/components/countdown/Countdown.vue';
import PromptResponse from '@/components/promptResponse/PromptResponse.vue';
import Selection from '@/components/responseSelection/Selection.vue';
import ActiveMatching from '@/components/responseMatching/ActiveMatching.vue';
import MatchingSummary from '@/components/responseMatching/MatchingSummary.vue';
import EndRound from '@/components/endRound/EndRound.vue';
import EndGame from '@/components/endGame/EndGame.vue';
import VolumeControl from '@/components/gameShared/VolumeControl.vue';
import TooltipToggle from '@/components/gameShared/TooltipToggle.vue';
import { useRoomStore } from '@/stores/room';
import { useGameStore } from '@/stores/game';
import { Portal } from 'portal-vue';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const gameStore = useGameStore();
const roomStore = useRoomStore();
const router = useRouter();

const { t } = useI18n();

const props = defineProps({
  roomName: {
    type: String,
    required: true
  }
});

const gameScenes = {
  Lobby,
  Countdown,
  PromptResponse,
  Selection,
  ActiveMatching,
  MatchingSummary,
  EndRound,
  EndGame
};

onMounted(() => {
  if (props.roomName !== roomStore.roomName) {
    void router.push({ name: 'home', query: { name: props.roomName } });
  }
});

const helpLink = computed((): string => {
  const tips = {
    Lobby: '#overview',
    Countdown: '#prompt',
    PromptResponse: '#prompt',
    Selection: '#selection',
    ActiveMatching: '#matching',
    MatchingSummary: '#matching',
    EndRound: '#overview',
    EndGame: '#overview'
  };
  return router.resolve({ name: 'howToPlay', hash: tips[gameStore.scene] }).href;
});

const isMobile = computed((): boolean => {
  return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
});
</script>

<template>
  <div class="main-content d-flex w-xl-75 w-100 flex-grow-1 p-1 position-relative">
    <a
      class="btn btn-burgundy position-absolute top-0 end-0 mt-2 me-2 bi-question py-0 px-1 fs-6"
      target="_blank"
      :href="helpLink" />
    <component :is="gameScenes[gameStore.scene]" />

    <portal to="banner">
      <a
        v-if="gameStore.scene === 'Lobby' || gameStore.scene === 'EndGame'"
        href="https://www.buymeacoffee.com/ConorMurphy/"
        target="_blank"
        class="link-yellow fs-6 text-center">
        <div class="d-flex align-items-center justify-content-center gap-1">
          <span v-t="'coffeeBannerLink'" />
          <img :alt="t('coffeeAlt')" src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" height="25" />
        </div>
      </a>
    </portal>

    <!-- client side preferences -->
    <div v-if="!isMobile" class="position-fixed bottom-0 end-0 m-4 gap-1 d-flex justify-content-end align-items-end">
      <tooltip-toggle class="mb-1" />
      <volume-control />
    </div>
  </div>
</template>
