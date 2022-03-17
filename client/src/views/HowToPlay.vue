<template>
  <div class="main-content w-93 p-3 p-lg-5 text-center">
    <div v-for="section in $tm('howToPlay')">
      <h1 class="display-2">{{ section.header }}</h1>
      <p class="fw-normal">{{ section.body }}</p>
      <div v-for="child in section.children">
        <h3 class="display-6">{{ child.header }}</h3>
        <p class="fw-normal">{{ child.body }}</p>
      </div>
    </div>
  </div>
</template>

