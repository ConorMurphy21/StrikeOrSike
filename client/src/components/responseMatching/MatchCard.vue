<template>
  <div class="root d-flex flex-column gap-0">
    <div class="d-flex flex-row w-100 gap-1 justify-content-center align-items-center">
      <h2 v-if="match && match.response" class="match-content fs-3"> {{ match.response }} </h2>
      <img v-else-if="match" class="fs-3" src="@/assets/images/sike2.png" :alt="$t('sike')"/>
      <div v-else class=" p-3 d-flex justify-content-center align-items-center position-relative">
        <div class="dot-pulse"/>
      </div>
      <a @click="unmatchClick"
         @mouseenter="hovering=true"
         @mouseleave="hovering=false"
         :class="{'hover': hovering}"
         v-if="showUnmatch"><i class="bi-trash3-fill text-red fw-bolder fs-4"/></a>
    </div>
    <h2 class="player-name fs-5">{{ player.name }}</h2>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import ClickMp3 from '@/assets/audio/click2.mp3';

const room = createNamespacedHelpers('room');
const game = createNamespacedHelpers('game');

const click = new Audio(ClickMp3);

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
      return this.player.name === this.name;
    }
  },
  methods: {
    ...game.mapActions([
      'unmatch'
    ]),
    unmatchClick(){
      click.play();
      this.unmatch();
    }
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

a {
  transition: all 75ms ease-out;
}

.hover {
  transform: rotate(16deg) scale(1.09);
  cursor: pointer;
}

img {
  display: block;
  text-align: center;
  color: $blue;
  max-height: 45px;
}
</style>