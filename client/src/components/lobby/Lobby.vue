<template>
  <div class="w-100 h-100 d-flex flex-column justify-content-between align-items-center gap-3 pt-1 pb-4">
    <h1 v-t="'players'"/>
    <player-list/>

    <button class="btn btn-blue fs-4"
            :class="{'d-none': !canStart}" @click="startGame" v-t="'startGame'"/>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import PlayerList from '@/components/lobby/PlayerList.vue'
import ClickMp3 from '@/assets/audio/click2.mp3'

const click = new Audio(ClickMp3);

const {mapGetters, mapState} = createNamespacedHelpers('room')

export default {
  components: {
    PlayerList
  },
  computed: {
    ...mapState([
      'players'
    ]),
    ...mapGetters([
      'self',
    ]),
    canStart: function () {
      return this.self && this.self.leader && this.players.length >= 3;
    }
  },
  methods: {
    startGame() {
      click.play();
      this.$socket.emit('startGame');
    }
  }
}
</script>

<style lang="scss" scoped>
h1 {
  font-family: $header-font !important;
  font-size: 4rem;
  font-weight: normal;
  color: $red;
}

.btn {
  height: 60px;
  width: 30%;
  min-width: 150px;
}
</style>
