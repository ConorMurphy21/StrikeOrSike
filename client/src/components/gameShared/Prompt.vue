<template>
  <h1 v-if="containsBlank" class="display-5">
    {{ left }} <span class="blank" /> {{ right }} <vote-skip v-if="skippable" />
  </h1>
  <h1 v-else class="display-5">
    {{ prompt }} <vote-skip v-if="skippable" class="mb-2" />
  </h1>
</template>
<script lang="ts">
import VoteSkip from "@/components/promptResponse/VoteSkip.vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    VoteSkip,
  },
  props: {
    prompt: {
      type: String,
      required: true,
    },
    skippable: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    containsBlank(): boolean {
      return this.prompt.includes("_");
    },
    left(): string {
      return this.prompt.substring(0, this.prompt.indexOf("_"));
    },
    right(): string {
      return this.prompt.substring(this.prompt.lastIndexOf("_") + 1);
    },
  },
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
  border-bottom: 0.089em solid black;
  display: inline-block;
  border-radius: $border-radius;
}
</style>
