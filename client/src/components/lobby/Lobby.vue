<template>
  <div class="w-100 h-100 d-flex flex-column justify-content-between align-items-center gap-3 pt-1 pb-4">
    <h1 v-t="'players'"/>

    <player-list/>

    <button class="btn btn-blue fs-4"
            :class="{'d-none': !self || !self.leader}" @click="startGame" v-t="'startGame'"/>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import PlayerList from '@/components/lobby/PlayerList.vue'

const {mapGetters} = createNamespacedHelpers('room')

export default {
  components: {
    PlayerList
  },
  computed: {
    ...mapGetters([
      'self',
    ]),
  },
  methods: {
    startGame() {
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
}
</style>
