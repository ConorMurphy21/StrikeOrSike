<template>
  <div class="container">
    <div class="d-flex min-vh-100 flex-column justify-content-evenly align-items-center pb-1">
      <img class="w-lg-50 w-100 my-2" src="@/assets/images/logo.png" :alt="$t('strikeOrSike')">
      <router-view class="mt-2 mb-5"/>
      <portal-target  name="banner"/>
    </div>
  </div>
</template>

<style lang="scss">
@import '@/styles/app';
</style>

