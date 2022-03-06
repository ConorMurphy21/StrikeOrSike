<template>
  <div class="w-100 d-flex flex-column justify-content-start align-items-center p-3">
    <prompt :prompt="prompt"/>
    <p v-if="!isSelector" class="display-6 passiveMessage"
       v-t="{path: 'selection.message', args: {'player':selector.name}}"/>
    <i18n-t v-else keypath="selection.selfMessage" tag="p" class="display-6 activeMessage">
      <template v-slot:self>
        <span class="activeSelector display-6" v-t="'selection.self'"/>
      </template>
    </i18n-t>
    <selection-picker/>
    <response-list :selectable="isSelector" v-model="response"/>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import ResponseList from '@/components/gameShared/ResponseList.vue';
import SelectionPicker from '@/components/responseSelection/SelectionPicker.vue';
import Prompt from '@/components/gameShared/Prompt.vue';
import AlertMp3 from '@/assets/audio/alert.mp3';

const alert = new Audio(AlertMp3);
const {mapState, mapGetters} = createNamespacedHelpers('game');

export default {
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
    ...mapState([
      'prompt',
      'selectionType',
      'selector',
      'firstSelection'
    ]),
    ...mapGetters([
      'isSelector'
    ])
  },
  watch: {
    response: function (val) {
      this.$socket.emit('selectResponse', val);
    }
  }
}
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