<template>
  <div class="container vh-100 d-flex flex-column justify-content-evenly align-items-center">
    <img class="w-75 w-lg-50" src="@/assets/images/logo.png" :alt="$t('strikeOrSike')">
    <router-view class="m-4"/>
    <img class="invisible w-75 w-lg-50" src="@/assets/images/logo.png" :alt="$t('strikeOrSike')">
  </div>
</template>

<style lang="scss" scoped>
img {
  //min-width: 350px;
  //width: 60%;
}
</style>

<style lang="scss">
@import '@/styles/app';
</style>

