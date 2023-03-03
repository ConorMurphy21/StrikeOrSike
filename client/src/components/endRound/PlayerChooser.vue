<template>
  <div class="dropdown w-100">
    <button class="btn btn-dark dropdown-toggle w-100 cutoff-text"
            type="button"
            id="playerChooser"
            data-bs-toggle="dropdown"
            aria-expanded="false">
      {{selectedName}}
    </button>
    <ul class="dropdown-menu w-100" aria-labelledby="playerChooser">
      <li v-for="player in players">
        <button class="btn dropdown-item cutoff-text text-center"
        @click="value=player.id">
          {{player.name}}
        </button>
      </li>
    </ul>
  </div>
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
    },
    selectedName(){
      return this.players.find(player => player.id === this.modelValue).name;
    }
  },
  props: ['modelValue'],
  emits: ['update:modelValue']
}
</script>

<style scoped>
.cutoff-text{
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>