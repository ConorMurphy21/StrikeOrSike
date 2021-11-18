<script setup>
import Lobby from '@/components/lobby/Lobby.vue'
</script>

<template>
  <div class="w-75 h-100 border rounded">
    <lobby />
  </div>
</template>

<script>
export default {
  props:{
    roomName: String
  }
}
</script>


