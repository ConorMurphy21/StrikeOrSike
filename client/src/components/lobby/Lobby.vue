<template>
  <div class="w-100 d-flex flex-column justify-content-between align-items-center gap-3 pt-1 pb-4">
    <h1 class="font-fancy text-dark display-3" v-t="'players'"/>
    <player-list/>

    <div class="w-100 d-flex flex-column justify-content-start align-items-center gap-3">
      <options :disabled="!self || !self.leader"/>
      <span class="d-inline-block w-50 w-lg-25" v-tooltip.left="canStart ? '' : $t('tooltip.startDisabled')">
      <button class="btn btn-blue fs-4 w-100"
              :class="{'d-none': !leader, 'disabled': !canStart}"
              :disabled="!canStart"
              @click="startGame" v-t="'startGame'"/>
      </span>
    </div>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import PlayerList from '@/components/lobby/PlayerList.vue'
import Options from '@/components/lobby/Options.vue'
import ClickMp3 from '@/assets/audio/click2.mp3'
import {AudioWrap} from '@/mixins/audiowrap';

const click = new AudioWrap(ClickMp3);

const {mapGetters, mapState} = createNamespacedHelpers('room')

export default {
  components: {
    PlayerList,
    Options
  },
  computed: {
    ...mapState([
      'players'
    ]),
    ...mapGetters([
      'self',
    ]),
    leader: function () {
      return this.self && this.self.leader;
    },
    canStart: function() {
      return this.leader && this.players.length >= 3;
    }
  },
  methods: {
    startGame() {
      click.play();
      this.$socket.emit('startGame');
    },
  }
}
</script>
