<template>
  <div class="box d-flex flex-column justify-content-center align-items-center w-75 m-2 m-3 overflow-auto">
    <div class="list-group w-100 h-100">
      <div v-for="(response, index) in responses"
           class='list-group-item'
           :class="{'list-group-item-action selectable': selectable && !used(response),
                    'active': selected === index,
                    'list-group-item-red': used(response)}"
           @click="select(index, response)">
        {{ response }}
      </div>
    </div>
  </div>
</template>
<script>
import {createNamespacedHelpers} from 'vuex';
import Click1Mp3 from '@/assets/audio/click1.mp3'
import Click2Mp3 from '@/assets/audio/click2.mp3'

const click2 = new Audio(Click2Mp3);

const {mapState} = createNamespacedHelpers('game');

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
      'responses',
      'usedResponses'
    ]),
  },
  methods: {
    select(index, response) {

      if (this.selectable && !this.used(response)) {
        if (this.selected !== index) {
          new Audio(Click1Mp3).play();
          this.selected = index;
        } else {
          click2.play();
          this.$emit('update:modelValue', response);
        }
      }
    },
    used(response) {
      return this.usedResponses.includes(response);
    }
  }
}
</script>

<style lang="scss" scoped>
.selectable {
  cursor: pointer;
}

.box {
  max-height: 30vh;
  min-height: 200px;
}
</style>


