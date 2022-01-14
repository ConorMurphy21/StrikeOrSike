<script setup>
import ResponseList from '@/components/gameShared/ResponseList.vue';
import SelectionType from '@/components/responseSelection/SelectionType.vue';
import Prompt from '@/components/gameShared/Prompt.vue';
</script>

<template>
  <div class="w-100 h-100 d-flex flex-column justify-content-start align-items-center p-3">
    <prompt :prompt="prompt"/>
    <p v-if="!isSelector" class="my-auto passiveMessage" v-t="{path: 'selection.message', args: {'player':selector.name}}"/>
    <i18n-t v-else keypath="selection.selfMessage" tag="p" class="my-auto activeMessage">
      <template v-slot:self>
        <span class="activeSelector" v-t="'selection.self'"/>
      </template>
    </i18n-t>
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

<style lang="scss" scoped>
.activeMessage{
  font-size: 1.8rem;
  color: $red;
}
.activeSelector{
  font-size: 1.8rem;
  font-weight: 900;
  padding-left: 2px;
  padding-right: 2px;
  background-color: $blue;
}

</style>