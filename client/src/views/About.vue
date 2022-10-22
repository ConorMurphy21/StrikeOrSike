<template>
  <div class="main-content w-75 p-3 p-lg-5 text-center">
    <h1 class="display-3 font-fancy text-burgundy" v-t="'about.header'"/>
    <p v-t="'about.project'"/>
    <i18n-t keypath="about.openSource" tag="p">
      <template v-slot:github>
        <a href="https://github.com/ConorMurphy21/StrikeOrSike" v-t="'about.github'"/>
      </template>
      <template v-slot:issues>
        <a href="https://github.com/ConorMurphy21/StrikeOrSike/issues/new" v-t="'about.issues'"/>
      </template>
      <template v-slot:gmail>
        <a href="mailto:strikeorsike@gmail.com">strikeorsike@gmail.com</a>
      </template>
    </i18n-t>
    <i18n-t keypath="about.me" tag="p">
      <template v-slot:profile>
        <a href="https://www.linkedin.com/in/conormurphy21/" v-t="'about.profile'"/>
      </template>
      <template v-slot:coffee>
        <a href="https://www.buymeacoffee.com/ConorMurphy/" v-t="'about.coffee'"/>
      </template>
    </i18n-t>
  </div>
</template>
