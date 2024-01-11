<template>
  <div class="w-100 d-flex flex-column justify-content-between align-items-center gap-3 pt-1 pb-4">
    <h1 v-t="'players'" class="font-fancy text-dark display-3" />
    <player-list />

    <div class="w-100 d-flex flex-column justify-content-start align-items-center gap-3">
      <options :disabled="!leader" />
      <span v-tooltip.left="canStart ? '' : $t('tooltip.startDisabled')" class="d-inline-block w-50 w-lg-25">
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

<script lang="ts">
import PlayerList from '@/components/lobby/PlayerList.vue'
import Options from '@/components/lobby/Options.vue'
import ClickMp3 from '@/assets/audio/click2.mp3'
import { AudioWrap } from '@/mixins/audiowrap.js'
import socket from '@/socket/socket.js'
import { mapState } from 'pinia'
import { useRoomStore } from '@/stores/room.js'
import { defineComponent } from 'vue'

const click = new AudioWrap(ClickMp3)

export default defineComponent({
  components: {
    PlayerList,
    Options
  },
  computed: {
    ...mapState(useRoomStore, ['players', 'self']),
    leader: function () {
      return this.self && this.self.leader
    },
    canStart: function () {
      return this.leader && this.players.length >= 3
    }
  },
  methods: {
    startGame() {
      click.play()
      socket.emit('startGame')
    }
  }
})
</script>
