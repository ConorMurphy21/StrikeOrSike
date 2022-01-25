<template>
  <h1>{{prompt}}</h1>
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
  font-size: 2.75rem;
  font-weight: 650;
  text-align: center;
}
</style>