<template>
  <div class="root">
    <div class="d-flex flex-row w-100 gap-1 justify-content-center align-items-center"
         @mouseenter="hovering=true" @mouseleave="hovering=false">
      <h1 v-if="match && match.response" class="fs-3"> {{ match.response }} </h1>
      <img v-else-if="match" class="fs-3" src="@/assets/images/sike.png" :alt="$t('sike')"/>
      <div v-else class=" p-3 d-flex justify-content-center align-items-center position-relative">
        <div class="dot-pulse"/>
      </div>
      <a @click="unmatch" v-if="showUnmatch"><i class="bi-trash3-fill text-red fw-bolder fs-4"/></a>
    </div>
    <h2 class="fs-5">{{ player.name }}</h2>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';

const room = createNamespacedHelpers('room');
const game = createNamespacedHelpers('game');

export default {
  props: {
    player: Object,
    match: Object
  },
  data() {
    return {
      hovering: false
    }
  },
  computed: {
    ...room.mapState([
      'name'
    ]),
    showUnmatch() {
      return this.player.name === this.name && this.hovering;
    }
  },
  methods: {
    ...game.mapActions([
        'unmatch'
    ]),
  }
}
</script>

<style lang="scss" scoped>
.root {
  width: 150px;
  max-width: 150px;
}

h1 {
  font-weight: bolder;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
  color: $orange;
  margin-bottom: auto;
  margin-top: auto;
  white-space: nowrap;
}

h2 {
  max-width: 150px;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
}

img {
  max-height: 50px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  color: $red;
}
</style>