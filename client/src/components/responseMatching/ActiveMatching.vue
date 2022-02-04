<template>
  <div class="w-100 h-100 d-flex flex-column justify-content-start align-items-center p-3">
    <prompt :prompt="prompt"/>
    <i18n-t keypath="activeMatchingMessage" tag="p">
      <template v-slot:player>
        <span class="player">{{ selector.name }}</span>
      </template>
      <template v-slot:response>
        <span class="responseMessage">{{ selectedResponse }}</span>
      </template>
      <template v-slot:type>
        <span :class="selectionType" v-t="selectionType"/>
      </template>
    </i18n-t>
    <button class="btn btn-primary w-50 fs-4" @click="noMatch"><img src="@/assets/images/sike.png" :alt="$t('sike')"></button>
    or
    <response-list :selectable="true" v-model="matchedResponse"/>

  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import ResponseList from '@/components/gameShared/ResponseList.vue';
import Prompt from '@/components/gameShared/Prompt.vue';
import ClickMp3 from '@/assets/audio/click2.mp3';
import AlertMp3 from '@/assets/audio/alert.mp3';

const click = new Audio(ClickMp3);
const alert = new Audio(AlertMp3);

const {mapState} = createNamespacedHelpers('game');

export default {
  data() {
    return {
      matchedResponse: '',
    }
  },
  components: {
    ResponseList,
    Prompt
  },
  mounted() {
    alert.play();
  },
  computed: {
    ...mapState([
      'prompt',
      'selectionType',
      'selectedResponse',
      'selector'
    ]),
  },
  watch: {
    matchedResponse: function (val) {
      this.$socket.emit('selectMatch', val);
    }
  },
  methods: {
    noMatch() {
      click.play();
      this.$socket.emit('selectMatch', '');
    }
  }
}
</script>

<style lang="scss" scoped>
img{
  width: 25%;
}
p{
  text-align: center;
}
.responseMessage{
  text-align: center;
  font-weight: 900;
  font-size: 1.6rem;
  color: $red;
}
.strike{
  font-weight: 900;
  font-size: 1.6rem;
  color: $orange;
}
.sike{
  font-weight: 900;
  font-size: 1.6rem;
  color: $blue;
}
</style>
