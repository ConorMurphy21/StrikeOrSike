<template>
  <div class="w-100 shadow-lg p-3 m-1 rounded" :class="{'bg-danger': !player.active, 'bg-body': player.active}">
    <h4 class="text-center">{{ player.name }}</h4>
  </div>
</template>

<script>
export default {
  props: {
    player: Object
  }
}
</script>