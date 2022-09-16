<template>
  <div class="root">
<!--    <h1 v-if="this.match && this.match.response" class="fs-3"> {{ match.response }} </h1>-->
<!--    <img v-else class="fs-3" :src="typeImg" :alt="imgAlt"/>-->
    <div class=" p-3 d-flex justify-content-center align-items-center position-relative">
    <div class="dot-pulse"></div>
    </div>
    <h2 class="fs-5">{{ player.name }}</h2>
  </div>
</template>

<script>
import StrikeImg from '@/assets/images/strike.png';
import SikeImg from '@/assets/images/sike.png';
import PendingImg from '@/assets/images/pending.gif';

export default {
  props: {
    player: Object,
    match: Object
  },
  computed: {
    typeImg() {
      if (this.match && !this.match.response) {
        return SikeImg;
      } else {
        return PendingImg;
      }
    },
    imgAlt() {
      if (this.match && !this.match.response) {
        return this.$t('sike');
      } else {
        return this.$t('pending');
      }
    }
  },
}
</script>

<style lang="scss" scoped>
.root {
  width: 150px;
  max-width: 150px;
}

h1 {
  max-width: 150px;
  font-weight: bolder;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
  color: $orange;
  margin: auto;
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