<template>
  <!-- desktop view -->
  <div
    class="d-md-flex d-none flex-row align-items-center justify-content-center w-75"
    :class="{ 'justify-content-between': choice && isSelector }">
    <button
      v-if="choice && isSelector"
      v-tooltip.left.ds750="$t('tooltip.strike')"
      v-t="'strike'"
      class="btn btn-orange w-25"
      @click="selectSelectionType(true)" />
    <selection-type :tooltip="!(isSelector && choice)" />
    <button
      v-if="choice && isSelector"
      v-tooltip.right.ds750="$t('tooltip.sike')"
      v-t="'sike'"
      class="btn btn-blue w-25"
      @click="selectSelectionType(false)" />
  </div>
  <!-- mobile view -->
  <div class="d-md-none d-flex flex-column align-items-center w-75">
    <selection-type />
    <div
      v-if="choice && isSelector"
      class="d-flex flex-row align-items-center justify-content-around gap-3 w-100">
      <button
        v-tooltip.left.ds750="$t('tooltip.strike')"
        v-t="'strike'"
        class="btn btn-orange w-50"
        @click="selectSelectionType(true)" />
      <h3>or</h3>
      <button
        v-tooltip.right.ds750="$t('tooltip.sike')"
        v-t="'sike'"
        class="btn btn-blue w-50"
        @click="selectSelectionType(false)" />
    </div>
  </div>
</template>

<script lang="ts">
import SelectionType from "@/components/gameShared/SelectionType.vue";
import ClickMp3 from "@/assets/audio/click2.mp3";
import { AudioWrap } from "@/mixins/audiowrap.js";
import socket from "@/socket/socket";
import { useGameStore } from "@/stores/game.js";
import { mapState } from "pinia";
import { defineComponent } from "vue";

export default defineComponent({
  components: { SelectionType },
  data() {
    return {
      lastPicked: false,
    };
  },
  computed: {
    ...mapState(useGameStore, {
      type: "selectionType",
      choice: "selectionTypeChoice",
      isSelector: "isSelector",
    }),
  },
  methods: {
    selectSelectionType(strike: boolean) {
      new AudioWrap(ClickMp3).play();
      if (this.type === "choice" || this.lastPicked !== strike) {
        socket.emit("selectSelectionType", strike);
        this.lastPicked = strike;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
button {
  font-size: 1.4rem;
}
</style>
