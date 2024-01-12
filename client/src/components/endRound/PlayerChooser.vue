<template>
  <div class="d-flex flex-row justify-content-center align-items-center gap-2">
    <a
      class="bi-caret-left-fill"
      :class="{ hover: hoverLeft, 'text-dark': !hoverLeft }"
      @mouseenter="hoverLeft = true"
      @mouseleave="hoverLeft = false"
      @click="nextPlayer(false)" />
    <div class="dropdown flex-grow-1">
      <button
        id="playerChooser"
        class="btn btn-dark w-100 cutoff-text"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        @click="clickDropdown()">
        {{ selectedName }}
      </button>
      <ul class="dropdown-menu w-100" aria-labelledby="playerChooser">
        <li v-for="player in players" :key="player.id">
          <button class="btn dropdown-item cutoff-text text-center" @click="clickOption(player.id)">
            {{ player.name }}
          </button>
        </li>
      </ul>
    </div>
    <a
      class="bi-caret-right-fill"
      :class="{ hover: hoverRight, 'text-dark': !hoverRight }"
      @mouseenter="hoverRight = true"
      @mouseleave="hoverRight = false"
      @click="nextPlayer(true)" />
  </div>
</template>

<script lang="ts">
import Click1Mp3 from '@/assets/audio/click1.mp3';
import Click2Mp3 from '@/assets/audio/click2.mp3';
import { AudioWrap } from '@/mixins/audiowrap.js';
import { useRoomStore } from '@/stores/room.js';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    modelValue: {
      type: String,
      required: true
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      hoverLeft: false,
      hoverRight: false
    };
  },
  computed: {
    ...mapState(useRoomStore, ['players']),
    value: {
      get(): string {
        return this.modelValue;
      },
      set(value: string) {
        this.$emit('update:modelValue', value);
      }
    },
    selectedName() {
      if (!this.modelValue) return '';
      return this.players.find((player) => player.id === this.modelValue)?.name;
    }
  },
  methods: {
    nextPlayer(right: boolean) {
      const direction = right ? 1 : -1;
      let index = this.players.findIndex((player) => player.id === this.modelValue);
      index = (index + direction + this.players.length) % this.players.length;
      this.value = this.players[index].id;
      new AudioWrap(Click2Mp3).play();
    },
    clickOption(value: string) {
      this.value = value;
      new AudioWrap(Click2Mp3).play();
    },
    clickDropdown() {
      new AudioWrap(Click1Mp3).play();
    }
  }
});
</script>

<style lang="scss" scoped>
.cutoff-text {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.hover {
  cursor: pointer;
  color: tint-color($dark, 15%);
}
</style>
