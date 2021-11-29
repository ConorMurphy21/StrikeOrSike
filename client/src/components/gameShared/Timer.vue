<template>
  <h1>{{time}}</h1>
</template>

<script>
export default {
  props:{
    time: Number
  },
  watch:{
    //todo: change style and sounds
    "time": (val) => {

    }
  }
}
</script>
