<script setup>
import ResponseList from '@/components/gameShared/ResponseList.vue';
import Prompt from '@/components/gameShared/Prompt.vue';
import SikeImg from '@/assets/sike.png';
</script>

<template>
  <div class="w-100 h-100 d-flex flex-column justify-content-start align-items-center p-3">
    <prompt :prompt="prompt"/>
    <i18n-t keypath="activeMatchingMessage" tag="p">
      <template v-slot:player>
        <span class="player">{{ selector.name }}</span>
      </template>
      <template v-slot:response>
        <span class="response">{{ selectedResponse }}</span>
      </template>
    </i18n-t>
    <button class="btn btn-primary w-50 fs-4" @click="noMatch"><img :src="SikeImg" :alt="$t('sike')"></button>
    <response-list :selectable="true" v-model="matchedResponse"/>

  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';

const {mapState} = createNamespacedHelpers('game');

export default {
  data() {
    return {
      matchedResponse: '',
    }
  },
  computed: {
    ...mapState([
      'prompt',
      'selectionType',
      'selectedResponse',
      'selector'
    ])
  },
  watch: {
    matchedResponse: function (val) {
      this.$socket.emit('selectMatch', val);
    }
  },
  methods: {
    noMatch() {
      this.$socket.emit('selectMatch', '');
    }
  }
}
</script>

<style lang="scss" scoped>
img{
  width: 25%;
}
</style>
