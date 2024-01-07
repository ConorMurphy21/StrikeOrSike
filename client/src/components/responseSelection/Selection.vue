<template>
  <div class="w-100 d-flex flex-column justify-content-start align-items-center py-3 px-4">
    <prompt :prompt="prompt"/>
    <p v-if="!isSelector" class="display-6 passiveMessage mb-0"
       v-t="{path: 'selection.message', args: {'player': selector?.name}}"/>
    <i18n-t v-else keypath="selection.selfMessage" tag="p" class="display-6 activeMessage mb-0">
      <template #self>
        <span class="activeSelector display-6" v-t="'selection.self'"/>
      </template>
    </i18n-t>
    <selection-picker/>
    <response-list :selectable="isSelector && selectionType !== 'choice'" :height="40" v-model="response"/>
  </div>
</template>

<script lang="ts">
import ResponseList from '@/components/gameShared/ResponseList.vue';
import SelectionPicker from '@/components/responseSelection/SelectionPicker.vue';
import Prompt from '@/components/gameShared/Prompt.vue';
import AlertMp3 from '@/assets/audio/alert.mp3';
import {AudioWrap} from '@/mixins/audiowrap.js';
import socket from '@/socket/socket';
import { useGameStore } from '@/stores/game.js';
import { mapState } from 'pinia';
import { defineComponent } from "vue";

const alert = new AudioWrap(AlertMp3);

export default defineComponent({
  data() {
    return {
      response: '',
    }
  },
  components: {
    ResponseList,
    SelectionPicker,
    Prompt
  },
  mounted() {
    if (this.isSelector && !this.firstSelection) {
      alert.play();
    }
  },
  computed: {
    ...mapState(useGameStore, [
      'prompt',
      'selectionType',
      'selector',
      'firstSelection',
      'isSelector'
    ]),
  },
  watch: {
    response: function (val) {
      socket.emit('selectResponse', val);
    }
  }
});
</script>

<style lang="scss" scoped>
.activeMessage {
  font-weight: 500;
  text-align: center;
}

.passiveMessage {
  font-weight: 500;
  text-align: center;
}

.activeSelector {
  color: $red;
  font-weight: 900;
  padding-left: 1px;
  padding-right: 1px;
  text-decoration: 3px underline;
}

</style>