<template>
  <div class="w-100 p-3" :class="{'disabled': !player.active, 'bg-primary': player.active}">
    <h1 class="fs-5 text-center my-auto">{{ player.name }}</h1>
  </div>
</template>

<script>
export default {
  props: {
    player: Object
  }
}
</script>

<style lang="scss" scoped>
h1 {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
div {
  border-radius: $border-radius;
}
.disabled{
  background-color: $gray-600;
}
</style>
