<template>
  <select class="form-select-lg" @input="$emit('update:modelValue', $event.target.value)">
    <option v-for="player in players" :selected="player.id === self.id" :value="player.id">
      {{player.name}}
    </option>
  </select>
</template>

<script>

import {createNamespacedHelpers} from 'vuex';
const {mapState, mapGetters} = createNamespacedHelpers('room');

export default {
  computed: {
    ...mapState([
        'players'
    ]),
    ...mapGetters([
        'self'
    ]),
  },
  emits: ['update:modelValue']
}
</script>