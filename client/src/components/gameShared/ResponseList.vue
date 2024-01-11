<!--suppress CssUnusedSymbol -->
<template>
  <div class="outer flex-grow-1 d-flex flex-column justify-content-between align-items-center w-100">
    <div
      ref="box"
      :style="cssProps"
      class="box d-flex flex-column justify-content-center align-items-center w-75 m-2 overflow-auto">
      <div class="list-group w-100 h-100">
        <button
          v-for="(response, index) in responses"
          :key="response"
          class="list-group-item text-start fw-bold"
          :class="{
            'list-group-item-action': responseSelectable(response),
            'pe-none': !responseSelectable(response),
            active: selected === index,
            'list-group-item-orange': response === selectedStrike, // will override used
            'list-group-item-blue': response === selectedSike,
            'list-group-item-red': used(response)
          }"
          @click="select(index, response)">
          {{ response }}
        </button>
      </div>
    </div>
    <transition name="confirm">
      <div v-if="selected !== -1" class="d-flex flex-row gap-2 w-75 justify-content-between">
        <button v-t="'cancel'" class="btn btn-red w-50 w-lg-25" @click="deselect" />
        <button v-t="'confirm'" class="btn btn-blue w-50 w-lg-25" @click="confirm" />
      </div>
    </transition>
  </div>
</template>
<script lang="ts">
import Click1Mp3 from '@/assets/audio/click1.mp3'
import Click2Mp3 from '@/assets/audio/click2.mp3'
import { AudioWrap } from '@/mixins/audiowrap.js'
import { useGameStore } from '@/stores/game.js'
import { mapState } from 'pinia'
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    selectable: Boolean,
    height: {
      type: Number,
      default: 30
    },
    playerId: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      selected: -1
    }
  },
  computed: {
    ...mapState(useGameStore, ['playerResponses']),
    responses() {
      return this.playerResponses(this.playerId).all
    },
    usedResponses() {
      return this.playerResponses(this.playerId).used
    },
    selectedStrike() {
      return this.playerResponses(this.playerId).selectedStrike
    },
    selectedSike() {
      return this.playerResponses(this.playerId).selectedSike
    },
    cssProps() {
      return {
        '--max-height': this.height + 'vh'
      }
    }
  },
  methods: {
    select(index: number, response: string) {
      if (this.selectable && !this.used(response)) {
        if (this.selected !== index) {
          new AudioWrap(Click1Mp3).play()
          this.selected = index
        } else {
          new AudioWrap(Click2Mp3).play()
          this.$emit('update:modelValue', response)
        }
      }
    },
    deselect() {
      new AudioWrap(Click2Mp3).play()
      this.selected = -1
    },
    confirm() {
      this.select(this.selected, this.responses[this.selected])
    },
    responseSelectable(response: string) {
      return !this.usedResponses.includes(response) && this.selectable
    },
    used(response: string) {
      return response !== this.selectedStrike && response !== this.selectedSike && this.usedResponses.includes(response)
    }
  }
})
</script>

<style lang="scss" scoped>
.outer {
  min-height: 200px;
}

.box {
  max-height: max(var(--max-height), 250px);
}

.confirm-enter-active,
.confirm-leave-active {
  transition: opacity 0.5s ease;
}

.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
}
</style>
