<template>
  <div class="main-content w-93 p-3 p-lg-5 text-center">
    <div v-for="section in $tm('howToPlay')">
      <h1 class="font-fancy text-burgundy display-2 mb-3" :id="section.key">{{ section.header }}</h1>
      <p class="fw-normal">{{ section.body }}</p>
      <img class="w-93 w-md-50" v-if="imgs[section.key]" :src="imgs[section.key]" :alt="section.alt">
      <div v-for="child in section.children">
        <h3 class="fw-bold display-6" :id="child.key">{{ child.header }}</h3>
        <p class="fw-normal">{{ child.body }}</p>
        <img class="w-93 w-md-50" v-if="imgs[child.key]" :src="imgs[child.key]" :alt="child.alt">
      </div>
    </div>
  </div>
</template>

<script>
import Prompt from '@/assets/images/howToPlay/prompt.png';
import Strike from '@/assets/images/howToPlay/strike.png';
import Sike from '@/assets/images/howToPlay/sike.png';
import Choice from '@/assets/images/howToPlay/choice.png';
import Matching from '@/assets/images/howToPlay/matching.png';

export default {
  data(){
    return {
      imgs: {
        prompt: Prompt,
        strike: Strike,
        sike: Sike,
        choice: Choice,
        matching: Matching,
      }
    }
  }
}
</script>

