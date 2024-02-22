<script setup lang="ts">
import PlayerList from '@/components/lobby/PlayerList.vue';
import Options from '@/components/lobby/Options.vue';
import { computed } from 'vue';
import socket from '@/socket/socket.js';
import { AudioWrap } from '@/mixins/audiowrap.js';
import ClickMp3 from '@/assets/audio/click2.mp3';
import { useRoomStore } from '@/stores/room.js';
import { useI18n } from 'vue-i18n';
import { Portal, PortalTarget } from 'portal-vue';
const click = new AudioWrap(ClickMp3);
const roomStore = useRoomStore();

const leader = computed<boolean>(() => {
  return !!roomStore.self && roomStore.self.leader;
});
const canStart = computed<boolean>(() => {
  return leader.value && roomStore.players.length >= 3;
});

function startGame() {
  click.play();
  socket.emit('startGame');
}

const { t } = useI18n();
</script>
<template>
  <div class="w-100 d-flex flex-column justify-content-between align-items-center gap-3 pt-1 pb-4">
    <h1 v-t="'players'" class="font-fancy text-dark display-3" />
    <player-list />
    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
      Launch demo modal
    </button>

    <div id="exampleModal" class="modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="exampleModalLabel" class="modal-title">Modal title</h5>
          </div>
          <div class="modal-body">here is a asd</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary">Save changes</button>
          </div>
        </div>
      </div>
    </div>

    <div class="w-100 d-flex flex-column justify-content-start align-items-center gap-3">
      <options :disabled="!leader" />
      <span v-tooltip.left="canStart ? '' : t('tooltip.startDisabled')" class="d-inline-block w-50 w-lg-25">
        <button
          v-t="'startGame'"
          class="btn btn-blue fs-4 w-100"
          :class="{ 'd-none': !leader, disabled: !canStart }"
          :disabled="!canStart"
          @click="startGame" />
      </span>
    </div>
  </div>
</template>
