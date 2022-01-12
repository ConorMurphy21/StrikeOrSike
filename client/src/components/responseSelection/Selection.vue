<script setup>
import ResponseList from '@/components/gameShared/ResponseList.vue';
import SelectionType from '@/components/responseSelection/SelectionType.vue';
</script>

<template>
  <div class="w-100 h-100 d-flex flex-column justify-content-start align-items-center p-3">
    <h1>{{ prompt }}</h1>
    <h3 v-if="!isSelector" v-t="{ path: 'passiveSelectionMessage', args: { player: selector.name} }"/>
    <h3 v-else v-t="'activeSelectionMessage'"/>
    <selection-type/>
    <response-list :selectable="isSelector" v-model="response"/>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';

const {mapState, mapGetters} = createNamespacedHelpers('game');

export default {
  data() {
    return {
      response: '',
    }
  },
  computed: {
    ...mapState([
      'prompt',
      'selectionType',
      'selector'
    ]),
    ...mapGetters([
      'isSelector'
    ])
  },
  watch:{
    response: function (val) {
      this.$socket.emit('selectResponse', val);
    }
  }
}
</script>
