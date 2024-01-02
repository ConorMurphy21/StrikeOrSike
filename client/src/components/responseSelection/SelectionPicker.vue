<template>
  <!-- desktop view -->
  <div class="d-md-flex d-none flex-row align-items-center justify-content-center w-75"
       :class="{'justify-content-between': choice && isSelector}">
    <button v-if="choice && isSelector" class="btn btn-orange w-25"
            @click="selectSelectionType(true)"
            v-tooltip.left.ds750="$t('tooltip.strike')"
            v-t="'strike'"/>
    <selection-type :tooltip="!(isSelector && choice)"/>
    <button v-if="choice && isSelector" class="btn btn-blue w-25"
            @click="selectSelectionType(false)"
            v-tooltip.right.ds750="$t('tooltip.sike')"
            v-t="'sike'"/>
  </div>
  <!-- mobile view -->
  <div class="d-md-none d-flex flex-column align-items-center w-75">
    <selection-type/>
    <div v-if="choice && isSelector" class="d-flex flex-row align-items-center justify-content-around gap-3 w-100">
      <button class="btn btn-orange w-50"
              @click="selectSelectionType(true)"
              v-tooltip.left.ds750="$t('tooltip.strike')"
              v-t="'strike'"/>
      <h3>or</h3>
      <button class="btn btn-blue w-50"
              @click="selectSelectionType(false)"
              v-tooltip.right.ds750="$t('tooltip.sike')"
              v-t="'sike'"/>
    </div>
  </div>
</template>

<script>
import SelectionType from '@/components/gameShared/SelectionType.vue';
import ClickMp3 from '@/assets/audio/click2.mp3'
import {AudioWrap} from '@/mixins/audiowrap';
import socket from '@/socket/socket';
import { useGameStore } from '@/stores/game.js';
import { mapState } from 'pinia';

export default {
  data() {
    return {
      lastPicked: false
    }
  },
  components: {SelectionType},
  computed: {
    ...mapState(useGameStore, {
      type: 'selectionType',
      choice: 'selectionTypeChoice',
      isSelector: 'isSelector'
    })
  },
  methods: {
    selectSelectionType(strike) {
      new AudioWrap(ClickMp3).play();
      if (this.type === 'choice' || this.lastPicked !== strike) {
        socket.emit('selectSelectionType', strike);
        this.lastPicked = strike;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
button {
  font-size: 1.4rem;
}
</style>

