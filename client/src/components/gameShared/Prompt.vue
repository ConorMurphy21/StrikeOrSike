<template>
  <h1 class="display-4">{{prompt}}</h1>
</template>
<script>
export default {
  props: {
    prompt: String
  }
}
</script>
<style scoped>
h1 {
  font-weight: 650;
  text-align: center;
}
</style>