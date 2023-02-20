<template>
  <div class="root d-flex flex-column gap-0">
    <div class="d-flex flex-row w-100 gap-1 justify-content-center align-items-center"
         @mouseenter="hovering=true" @mouseleave="hovering=false" @click="hovering=true">
      <h2 v-if="match && match.response" class="match-content fs-3"> {{ match.response }} </h2>
      <img v-else-if="match" class="fs-3" src="@/assets/images/sike2.png" :alt="$t('sike')"/>
      <div v-else class=" p-3 d-flex justify-content-center align-items-center position-relative">
        <div class="dot-pulse"/>
      </div>
      <a @click="unmatch"
         v-click-outside="hoveringFalse"
         v-if="showUnmatch"><i class="bi-trash3-fill text-red fw-bolder fs-4"/></a>
    </div>
    <h2 class="player-name fs-5">{{ player.name }}</h2>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import vClickOutside from 'click-outside-vue3';

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
    hoveringFalse(){
      this.hovering=false;
    }
  },
  directives: {
    clickOutside: vClickOutside.directive
  },
}
</script>

<style lang="scss" scoped>
.root {
  width: 150px;
  max-width: 150px;
}

.match-content {
  font-weight: bolder;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
  color: $orange;
  margin-bottom: auto;
  margin-top: auto;
  white-space: nowrap;
  max-height: 45px;
}
.player-name {
  max-width: 150px;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
}

img {
  display: block;
  text-align: center;
  color: $blue;
  max-height: 45px;
}
</style>