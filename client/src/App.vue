<template>
  <div class="container vh-100 d-flex flex-column justify-content-top align-items-center">
    <img class="my-3" src="@/assets/logo.png" alt="Strike Or Sike">
    <router-view/>
    <img class="my-3 d-none" src="@/assets/logo.png" alt="Strike Or Sike">
      <!-- A really jenky way to approximately center the router-->
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

