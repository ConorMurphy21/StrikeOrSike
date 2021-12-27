<template>
  <div class="container">
    <div class="vh-100 d-flex flex-column justify-content-center align-items-center">
      <header>
        <h1 class="text-center mb-5 text-primary" style="min-height: 20%">
          Strike or Sike
        </h1>
      </header>
      <main class="w-100 mb-5 d-flex justify-content-center align-items-center" style="min-height: 70%;">
        <router-view/>
      </main>
      <!-- A really jenky way to approximately center the router-->
      <div style="min-height: 10%" />
    </div>
  </div>
</template>

<style lang="scss">
  @import '@/styles/app';
</style>

