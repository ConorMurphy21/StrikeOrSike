<script setup>
import PlayerList from '@/components/lobby/PlayerList.vue'
</script>

<template>
  <div class="w-100 h-100 d-flex flex-column justify-content-center align-items-center p-3">
    <player-list/>
    <div class="flex-grow-1"/>

    <button class="btn btn-primary w-50 fs-4">Start</button>
  </div>
</template>
