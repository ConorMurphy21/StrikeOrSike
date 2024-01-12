<template>
  <div class="w-100 d-flex flex-column justify-content-start align-items-center py-3 px-4">
    <prompt :prompt="prompt" />
    <i18n-t keypath="activeMatchingMessage" tag="p">
      <template #player>
        <span class="player">{{ selector?.name }}</span>
      </template>
      <template #response>
        <span class="responseMessage fs-4">{{ selectedResponse }}</span>
        <dispute-icon
          v-if="sikeDispute && selectionType === 'sike'"
          class="ms-2 me-1"
          :response="selectedResponse"
          :placement="'top'" />
      </template>
      <template #type>
        <span v-t="selectionType" :class="selectionType" />
      </template>
    </i18n-t>

    <button
      v-tooltip.left.ds900="$t('tooltip.noMatch', { response: selectedResponse })"
      class="btn btn-primary w-50 fs-4 d-flex justify-content-center align-items-center"
      @click="noMatch">
      <div class="d-flex justify-content-center align-items-center w-75">
        <img class="my-auto w-75 w-sm-50 w-lg-25" src="@/assets/images/sike.png" :alt="$t('sike')" />
      </div>
    </button>
    or
    <response-list v-model="matchedResponse" :selectable="true" :height="40" />
  </div>
</template>

<script lang="ts">
import ResponseList from '@/components/gameShared/ResponseList.vue';
import Prompt from '@/components/gameShared/Prompt.vue';
import ClickMp3 from '@/assets/audio/click2.mp3';
import AlertMp3 from '@/assets/audio/alert.mp3';
import DisputeIcon from '@/components/responseMatching/DisputeIcon.vue';
import { AudioWrap } from '@/mixins/audiowrap.js';
import socket from '@/socket/socket';
import { useGameStore } from '@/stores/game.js';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';

const click = new AudioWrap(ClickMp3);
const alert = new AudioWrap(AlertMp3);

export default defineComponent({
  components: {
    DisputeIcon,
    ResponseList,
    Prompt
  },
  data() {
    return {
      matchedResponse: ''
    };
  },
  computed: {
    ...mapState(useGameStore, ['prompt', 'selectionType', 'selectedResponse', 'selector', 'unmatched', 'sikeDispute'])
  },
  watch: {
    matchedResponse: function (val) {
      socket.emit('selectMatch', val);
    }
  },
  mounted() {
    if (!this.unmatched) {
      alert.play();
    }
  },
  methods: {
    noMatch() {
      click.play();
      socket.emit('selectMatch', '');
    }
  }
});
</script>

<style lang="scss" scoped>
p {
  text-align: center;
}

.responseMessage {
  text-align: center;
  font-weight: 900;
  color: $red;
}

.strike {
  color: $orange;
}

.sike {
  color: $blue;
}
</style>
