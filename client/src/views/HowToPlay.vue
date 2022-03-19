<template>
  <div class="main-content w-93 p-3 p-lg-5 text-center">
    <div v-for="section in $tm('howToPlay')">
      <h1 class="font-fancy text-burgundy display-2 mb-3">{{ section.header }}</h1>
      <p class="fw-normal">{{ section.body }}</p>
      <div v-for="child in section.children">
        <h3 class="font-fancy display-6">{{ child.header }}</h3>
        <p class="fw-normal">{{ child.body }}</p>
      </div>
    </div>
  </div>
</template>

