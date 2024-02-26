<script setup lang="ts">
import PlayerList from '@/components/lobby/PlayerList.vue';
import Options from '@/components/lobby/Options.vue';
import { computed, onUnmounted } from 'vue';
import socket from '@/socket/socket.js';
import { AudioWrap } from '@/mixins/audiowrap.js';
import ClickMp3 from '@/assets/audio/click2.mp3';
import { useRoomStore } from '@/stores/room.js';
import { useI18n } from 'vue-i18n';
import { Portal, PortalTarget } from 'portal-vue';
import { Modal } from 'bootstrap';
const click = new AudioWrap(ClickMp3);
const roomStore = useRoomStore();

onUnmounted(() => {
  Modal.getInstance(document.getElementById('recPlayersModal') as HTMLElement)?.dispose();
});

const leader = computed<boolean>(() => {
  return !!roomStore.self && roomStore.self.leader;
});
const canStart = computed<boolean>(() => {
  return leader.value && roomStore.players.length >= 3;
});

function startGameRequest() {
  if (roomStore.players.length <= 3) {
    //canStart is already checked so min players has been reached
    startGame();
  } else {
    //we have more than the recommended amount of players per room
    Modal.getOrCreateInstance(document.getElementById('recPlayersModal') as HTMLElement).show();
  }
}

function startGame() {
  Modal.getInstance(document.getElementById('recPlayersModal') as HTMLElement)?.hide();
  click.play();
  socket.emit('startGame');
}

const { t } = useI18n();
</script>
<template>
  <div class="w-100 d-flex flex-column justify-content-between align-items-center gap-3 pt-1 pb-4">
    <h1 v-t="'players'" class="font-fancy text-dark display-3" />
    <player-list />
    <portal to="modal">
      <div id="recPlayersModal" class="modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 id="exampleModalLabel" class="modal-title">Modal title</h5>
            </div>
            <div class="modal-body">here is a asd</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" @click="startGame">Start Game</button>
            </div>
          </div>
        </div>
      </div>
    </portal>

    <div class="w-100 d-flex flex-column justify-content-start align-items-center gap-3">
      <options :disabled="!leader" />
      <span v-tooltip.left="canStart ? '' : t('tooltip.startDisabled')" class="d-inline-block w-50 w-lg-25">
        <button
          v-t="'startGame'"
          class="btn btn-blue fs-4 w-100"
          :class="{ 'd-none': !leader, disabled: !canStart }"
          :disabled="!canStart"
          @click="startGameRequest" />
      </span>
    </div>
  </div>
</template>
