<template>
  <h1 v-if="containsBlank" class="display-4">
    {{left}} <span class="blank"/> {{right}}
  </h1>
  <h1 v-else class="display-4">{{prompt}}</h1>
</template>
<script>
export default {
  props: {
    prompt: String
  },
  computed: {
    containsBlank(){
      return this.prompt.includes('_');
    },
    left(){
      return this.prompt.substring(0, this.prompt.indexOf('_'));
    },
    right(){
      return this.prompt.substr(this.prompt.lastIndexOf('_')+1);
    }
  }
}
</script>
<style lang="scss" scoped>
h1 {
  font-weight: 650;
  text-align: center;
}
.blank {
  width: 3.2em;
  border-bottom: .089em solid black;
  display: inline-block;
  border-radius: $border-radius;
}
</style>