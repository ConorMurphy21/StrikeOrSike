<template>
  <div class="w-100 d-flex flex-column justify-content-start align-items-center py-3 px-4">
    <prompt :prompt="prompt"/>
    <i18n-t keypath="activeMatchingMessage" tag="p">
      <template v-slot:player>
        <span class="player">{{ selector.name }}</span>
      </template>
      <template v-slot:response>
        <span class="responseMessage fs-4">{{ selectedResponse }}</span>
        <dispute-icon v-if="sikeDispute && selectionType === 'sike'" class="ms-2 me-1 float"
                      :response="selectedResponse" :placement="'top'"/>
      </template>
      <template v-slot:type>
        <span :class="selectionType" v-t="selectionType"/>
      </template>
    </i18n-t>

    <button class="btn btn-primary w-50 fs-4" @click="noMatch">
      <img class="my-auto w-75 w-sm-50 w-lg-25" src="@/assets/images/sike.png" :alt="$t('sike')">
    </button>
    or
    <response-list :selectable="true" :height="35" v-model="matchedResponse"/>

  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import ResponseList from '@/components/gameShared/ResponseList.vue';
import Prompt from '@/components/gameShared/Prompt.vue';
import ClickMp3 from '@/assets/audio/click2.mp3';
import AlertMp3 from '@/assets/audio/alert.mp3';
import DisputeIcon from '@/components/responseMatching/DisputeIcon.vue';

const click = new Audio(ClickMp3);
const alert = new Audio(AlertMp3);

const {mapState, mapGetters} = createNamespacedHelpers('game');

export default {
  data() {
    return {
      matchedResponse: '',
    }
  },
  components: {
    DisputeIcon,
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
    ...mapGetters([
        'sikeDispute'
    ])
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

p{
  text-align: center;
}
.responseMessage{
  text-align: center;
  font-weight: 900;
  color: $red;
}
.strike{
  color: $orange;
}
.sike{
  color: $blue;
}
</style>
