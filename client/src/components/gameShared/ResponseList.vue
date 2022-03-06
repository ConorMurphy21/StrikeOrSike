<template>
  <div :style="cssProps"
       class="box d-flex flex-column justify-content-center align-items-center w-75 m-2 m-3 overflow-auto">
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
    height: {
      type: Number,
      default: 500
    }
  },
  emits: ['update:modelValue'],
  computed: {
    ...mapState([
      'responses',
      'usedResponses'
    ]),
    cssProps(){
      return{
        '--max-height': this.height + 'px'
      }
    }
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
@media screen and (max-height: 1000px){
  .box {
    max-height: 325px;
  }
}
@media screen and (max-height: 700px){
  .box {
    max-height: 250px;
  }
}
@media screen and (max-height: 500px){
  .box {
    max-height: 200px;
  }
}
.box {
  min-height: 200px;
}
</style>


