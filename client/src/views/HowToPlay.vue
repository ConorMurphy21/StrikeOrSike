<template>
  <div class="main-content w-93 p-3 p-lg-5 text-center">
    <div v-for="section in $tm('howToPlay')" :key="section.key">
      <h1 :id="section.key" class="font-fancy text-burgundy display-2 mb-3">
        {{ $rt(section.header) }}
      </h1>
      <p class="fw-normal">{{ $rt(section.body) }}</p>
      <img
        v-if="imgs[section.key]"
        class="border border-4 border-burgundy rounded w-93 w-md-50 mb-4"
        :src="imgs[section.key]"
        :alt="section.alt" />
      <div v-for="child in section.children" :key="child.key">
        <h3 :id="child.key" class="fw-bold display-6">
          {{ $rt(child.header) }}
        </h3>
        <p class="fw-normal">{{ $rt(child.body) }}</p>
        <img
          v-if="imgs[child.key]"
          class="border border-4 border-burgundy rounded w-93 w-md-50 mb-4"
          :src="imgs[child.key]"
          :alt="child.alt" />
      </div>
    </div>
    <router-link to="/" @click="onClick()">
      <button v-t="'homeButton'" type="button" class="btn btn-burgundy mt-5 w-25" />
    </router-link>
  </div>
</template>

<script lang="js">
import Prompt from '@/assets/images/howToPlay/prompt.png';
import Strike from '@/assets/images/howToPlay/strike.png';
import Sike from '@/assets/images/howToPlay/sike.png';
import Choice from '@/assets/images/howToPlay/choice.png';
import Matching from '@/assets/images/howToPlay/matching.png';
import ClickMp3 from '@/assets/audio/click1.mp3';
import { AudioWrap } from '@/mixins/audiowrap';
import { defineComponent } from 'vue';
const click = new AudioWrap(ClickMp3);

export default defineComponent({
  data() {
    return {
      imgs: {
        prompt: Prompt,
        strike: Strike,
        sike: Sike,
        choice: Choice,
        matching: Matching
      }
    };
  },
  methods: {
    onClick() {
      click.play();
    }
  }
});
</script>
