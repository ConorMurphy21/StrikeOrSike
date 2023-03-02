<template>
  <v-select class="text-center"
      v-model="value" :options="players" :reduce="(option) => option.id"
            :searchable="false" :clearable="false">
    <template v-slot:option="player">
      <span class="d-flex justify-content-center w-100">{{ player.name }}</span>
    </template>
  </v-select>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
const {mapState, mapGetters} = createNamespacedHelpers('room');

export default {
  components: {
    'v-select': window["vue-select"]
  },
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