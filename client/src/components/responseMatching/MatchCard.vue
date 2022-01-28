<template>
  <div>
    <img :src="typeImg" :alt="imgAlt"/>
    <h1>{{ player.name }}</h1>
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
    typeImg(){
      if(this.match){
       if(!this.match.response){
         return SikeImg;
       } else {
         return StrikeImg;
       }
      } else {
        return PendingImg;
      }
    },
    imgAlt(){
      if(this.match){
        if(!this.match.response){
          return this.$t('strike');
        } else {
          return this.$t('sike');
        }
      } else {
        return this.$t('pending');
      }
    }
  }
}
</script>

<style lang="scss" scoped>
div{
  width: 20%;
}
h1{
  text-align: center;
  font: inherit;
  font-size: 1.6rem;
}
img{
  width: 100%;
  display: block;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  font-size: 1.8rem;
  color: $red;
}
</style>