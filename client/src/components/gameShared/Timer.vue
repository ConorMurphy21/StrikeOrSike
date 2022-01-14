<template>
  <div>
    <h1>{{$n(time)}}</h1>
  </div>
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

<style lang="scss" scoped>
h1 {

  font-size: 3.25rem;
  color: black;
}

</style>