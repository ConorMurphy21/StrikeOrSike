<template>
  <div class="w-75">
    <img v-if="match" :src="typeImg" :alt="imgAlt" class="w-100"/>
    <h1>{{ player.name }}</h1>
  </div>
</template>

<script>
import StrikeImg from '@/assets/strike.png';
import SikeImg from '@/assets/sike.png';


export default {
  props: {
    player: Object,
    match: Object
  },
  computed: {
    typeImg(){
      if(this.match){
       if(!this.match.response){
         return SikeImg;
       } else {
         return StrikeImg;
       }
      }
    },
    imgAlt(){
      if(this.match){
        if(!this.match.response){
          return this.$t('strike');
        } else {
          return this.$t('sike');
        }
      }
    }
  }
}
</script>

<style scoped>

</style>