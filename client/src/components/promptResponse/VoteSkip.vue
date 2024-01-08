<template>
  <a
    v-tooltip.right="$t('tooltip.voteSkip')"
    class="btn btn-sm btn-orange text-white ratio-1x1 position-relative d-inline-flex justify-content-center align-items-center"
    :class="{ 'btn-blue': !skipVoteNext }"
    @click="sendVote"
  >
    <i class="bi-hand-thumbs-down fs-3 p-0 lh-sm" />

    <notification-count
      v-if="skipVoteCount"
      :width="22"
      class="position-absolute top-0 start-100 translate-middle fs-6"
    >
      {{ $n(skipVoteCount) }}
    </notification-count>
  </a>
</template>

<script lang="ts">
import ClickMp3 from '@/assets/audio/click2.mp3'
import NotificationCount from '@/components/gameShared/NotificationCount.vue'
import { AudioWrap } from '@/mixins/audiowrap.js'
import socket from '@/socket/socket'
import { useGameStore } from '@/stores/game.js'
import { mapState } from 'pinia'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    NotificationCount
  },
  data() {
    return {
      tooltips: []
    }
  },
  computed: {
    ...mapState(useGameStore, ['skipVoteCount', 'skipVoteNext'])
  },
  methods: {
    sendVote() {
      new AudioWrap(ClickMp3).play()
      socket.emit('pollVote', 'skipPrompt')
    }
  }
})
</script>
