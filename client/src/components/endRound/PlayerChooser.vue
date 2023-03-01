<template>
  <v-select v-model="value" :options="players" label="name" :reduce="(option) => option.id"
            :searchable="false" :clearable="false" />
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
const {mapState, mapGetters} = createNamespacedHelpers('room');

export default {
  computed: {
    ...mapState([
        'players'
    ]),
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  },
  props: ['modelValue'],
  emits: ['update:modelValue']
}
</script>
<style scoped>

</style>