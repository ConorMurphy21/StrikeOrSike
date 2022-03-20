<template>
  <div class="container min-vh-100">
    <div class="d-flex min-vh-100 flex-column justify-content-evenly align-items-center">
      <img class="w-lg-50 w-100 my-2" src="@/assets/images/logo.png" :alt="$t('strikeOrSike')">
      <router-view class="m-4"/>
      <img class="invisible w-75 w-lg-50" src="@/assets/images/logo.png" :alt="$t('strikeOrSike')">
    </div>
  </div>
</template>

<style lang="scss">
@import '@/styles/app';
</style>

