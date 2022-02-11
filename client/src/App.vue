<template>
  <div class="container vh-100 d-flex flex-column justify-content-evenly align-items-center">
    <img src="@/assets/images/logo.png" :alt="$t('strikeOrSike')">
    <router-view/>
    <img class="invisible" src="@/assets/images/logo.png" :alt="$t('strikeOrSike')">
  </div>
</template>

<style lang="scss" scoped>
img {
  min-width: 350px;
  width: 55%;
}
</style>

<style lang="scss">
@import '@/styles/app';
</style>

