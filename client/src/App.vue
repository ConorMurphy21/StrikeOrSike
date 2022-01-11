<template>
  <div class="container vh-100 d-flex flex-column justify-content-top align-items-center">
    <img class="my-3" src="@/assets/logo.png" alt="Strike Or Sike">
    <router-view/>
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

