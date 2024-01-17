<template>
  <button
    v-tooltip="{ title: $t('tooltip.dispute', { response }), placement }"
    class="btn btn-sm btn-orange text-white ratio-1x1 position-relative d-inline-flex justify-content-center align-items-center"
    :class="{ 'btn-blue': !sikeDisputeNext }"
    :disabled="disabled"
    @click="sendVote">
    <i class="bi-hand-thumbs-down fs-5 lh-sm" />
    <notification-count
      v-if="sikeDisputeCount"
      :width="22"
      class="position-absolute top-0 start-100 translate-middle"
      :next-majority="sikeDisputeNext">
      {{ $n(sikeDisputeCount) }}
    </notification-count>
  </button>
</template>

<script lang="ts">
import NotificationCount from '@/components/gameShared/NotificationCount.vue'
import ClickMp3 from '@/assets/audio/click2.mp3'
import { AudioWrap } from '@/mixins/audiowrap.js'
import socket from '@/socket/socket'
import { useGameStore } from '@/stores/game.js'
import { mapState } from 'pinia'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    NotificationCount
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    response: {
      type: String,
      required: true
    },
    placement: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      tooltips: []
    }
  },
  computed: {
    ...mapState(useGameStore, ['sikeDisputeCount', 'sikeDisputeNext'])
  },
  methods: {
    sendVote() {
      new AudioWrap(ClickMp3).play()
      socket.emit('pollVote', 'sikeDispute')
    }
  }
})
</script>

<style>
:focus:not(:focus-visible) {
  outline: 0;
  box-shadow: none;
}
</style>
