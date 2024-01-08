<template>
  <div class="w-100 d-flex flex-column justify-content-between align-items-center py-3 px-4">
    <prompt :prompt="prompt" :skippable="true" />
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
        @keyup.enter="sendResponse"
      />
      <timer :time="timer"></timer>
    </div>
  </div>
</template>

<script lang="ts">
import ResponseList from '@/components/gameShared/ResponseList.vue'
import Timer from '@/components/gameShared/Timer.vue'
import Prompt from '@/components/gameShared/Prompt.vue'
import socket from '@/socket/socket'
import { useGameStore } from '@/stores/game.js'
import { mapState } from 'pinia'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    ResponseList,
    Timer,
    Prompt
  },
  data() {
    return {
      response: ''
    }
  },
  computed: {
    ...mapState(useGameStore, ['timer', 'prompt', 'promptSkipping'])
  },
  mounted() {
    // only autofocus if the user is not on mobile
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      ;(this.$refs.resInput as HTMLInputElement).focus()
    }
  },
  methods: {
    sendResponse() {
      if (this.response !== '') {
        socket.emit('promptResponse', this.response)
        this.response = ''
      }
    }
  }
})
</script>
