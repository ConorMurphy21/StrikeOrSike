<template>
    <h1 v-if="containsBlank" class="display-5">
      {{ left }} <span class="blank"/> {{ right }} <vote-skip v-if="skippable"/>
    </h1>
    <h1 v-else class="display-5">{{ prompt }} <vote-skip class="mb-2" v-if="skippable"/> </h1>
</template>
<script>
import VoteSkip from '@/components/promptResponse/VoteSkip.vue';
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    VoteSkip
  },
  props: {
    prompt: String,
    skippable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    containsBlank() {
      return this.prompt.includes('_');
    },
    left() {
      return this.prompt.substring(0, this.prompt.indexOf('_'));
    },
    right() {
      return this.prompt.substring(this.prompt.lastIndexOf('_') + 1);
    }
  }
});
</script>
<style lang="scss" scoped>
h1 {
  font-weight: 650;
  text-align: center;
  overflow-wrap: break-word;
  hyphens: auto;
}

.blank {
  width: 3.2em;
  border-bottom: .089em solid black;
  display: inline-block;
  border-radius: $border-radius;
}
</style>