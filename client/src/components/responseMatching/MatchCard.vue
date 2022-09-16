<template>
  <div class="root">
    <h1 v-if="this.match && this.match.response" class="fs-3"> {{ match.response }} </h1>
    <img v-else-if="this.match" class="fs-3" src="@/assets/images/sike.png" :alt="$t('sike')"/>
    <div v-else class=" p-3 d-flex justify-content-center align-items-center position-relative">
      <div class="dot-pulse"/>
    </div>
    <h2 class="fs-5">{{ player.name }}</h2>
  </div>
</template>

<script>

export default {
  props: {
    player: Object,
    match: Object
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