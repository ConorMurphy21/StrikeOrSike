<template>
  <div class="d-flex flex-column justify-content-center align-items-center w-75 h-100 m-2 m-3 overflow-auto">
    <div class="list-group w-100 h-100">
      <div v-for="(response, index) in responses"
           class='list-group-item'
           :class="{'list-group-item-action': selectable,
                    'active': selected === index}"
           @click="select(index, response)">
        {{ response }}
      </div>
    </div>
  </div>
</template>
<script>
import {createNamespacedHelpers} from 'vuex';

const {mapState} = createNamespacedHelpers('game')

export default {
  data() {
    return {
      selected: -1
    }
  },
  props: {
    selectable: Boolean,
  },
  emits: ['update:modelValue'],
  computed: {
    ...mapState([
      'responses'
    ])
  },
  methods: {
    select(index, response) {
      if (this.selectable) {
        if (this.selected !== index) {
          this.selected = index;
        } else {
          this.$emit('update:modelValue', response);
        }
      }
    }
  }
}
</script>

