<template>
  <div class="main-content w-75 p-3 p-lg-5 text-center">
    <h1 v-t="'about.header'" class="display-3 font-fancy text-burgundy" />
    <p v-t="'about.project'" />
    <i18n-t keypath="about.openSource" tag="p">
      <template #github>
        <a v-t="'about.github'" href="https://github.com/ConorMurphy21/StrikeOrSike" />
      </template>
      <template #issues>
        <a v-t="'about.issues'" href="https://github.com/ConorMurphy21/StrikeOrSike/issues/new" />
      </template>
      <template #gmail>
        <a href="mailto:strikeorsike@gmail.com">strikeorsike@gmail.com</a>
      </template>
    </i18n-t>
    <i18n-t keypath="about.me" tag="p">
      <template #profile>
        <a v-t="'about.profile'" href="https://www.linkedin.com/in/conormurphy21/" />
      </template>
      <template #coffee>
        <a v-t="'about.coffee'" href="https://www.buymeacoffee.com/ConorMurphy/" />
      </template>
    </i18n-t>
    <router-link to="/" @click="onClick">
      <button v-t="'homeButton'" type="button" class="btn btn-burgundy mt-3 w-25" />
    </router-link>
  </div>
</template>

<script lang="ts">
import ClickMp3 from '@/assets/audio/click1.mp3';
import { AudioWrap } from '@/mixins/audiowrap';
import { defineComponent } from 'vue';

const click = new AudioWrap(ClickMp3);

export default defineComponent({
  methods: {
    onClick() {
      click.play();
    }
  }
});
</script>
