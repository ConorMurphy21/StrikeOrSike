<template>
  <div class="outer flex-grow-1 d-flex flex-column justify-content-between align-items-center w-100">
    <div :style="cssProps" ref="box"
         class="box d-flex flex-column justify-content-center align-items-center w-75 m-2 overflow-auto">
      <div class="list-group w-100 h-100">
        <button v-for="(response, index) in responses"
                class='list-group-item text-start fw-bold'
                :class="{'list-group-item-action': responseSelectable(response),
                    'pe-none': !responseSelectable(response),
                    'active': selected === index,
                    'list-group-item-orange': response === strikedResponse, // will override used
                    'list-group-item-blue': response === sikedResponse,
                    'list-group-item-red': used(response)}"
                @click="select(index, response)">
          {{ response }}
        </button>
      </div>
    </div>
    <transition name="confirm">
      <div v-if="selected !== -1" class="d-flex flex-row gap-2 w-75 justify-content-between">
        <button class="btn btn-red w-50 w-lg-25" @click="deselect" v-t="'cancel'"/>
        <button class="btn btn-blue w-50 w-lg-25" @click="confirm" v-t="'confirm'"/>

      </div>
    </transition>
  </div>
</template>
<script>
import {createNamespacedHelpers} from 'vuex';
import Click1Mp3 from '@/assets/audio/click1.mp3'
import Click2Mp3 from '@/assets/audio/click2.mp3'

const {mapState} = createNamespacedHelpers('game');

export default {
  data() {
    return {
      selected: -1,
    }
  },
  props: {
    selectable: Boolean,
    height: {
      type: Number,
      default: 30
    }
  },
  emits: ['update:modelValue'],
  computed: {
    ...mapState([
      'responses',
      'usedResponses',
      'strikedResponse',
      'sikedResponse',
    ]),
    cssProps() {
      return {
        '--max-height': this.height + 'vh'
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
          new Audio(Click2Mp3).play();
          this.$emit('update:modelValue', response);
        }
      }
    },
    deselect() {
      new Audio(Click2Mp3).play();
      this.selected = -1;
    },
    confirm() {
      this.select(this.selected, this.responses[this.selected]);
    },
    responseSelectable(response) {
      return !this.usedResponses.includes(response) && this.selectable;
    },
    used(response) {
      return response !== this.strikedResponse &&
          response !== this.sikedResponse &&
          this.usedResponses.includes(response);
    },
  },
}
</script>

<style lang="scss" scoped>

.outer {
  min-height: 200px;
}

.box {
  max-height: max(var(--max-height), 250px);
}

.confirm-enter-active,
.confirm-leave-active {
  transition: opacity 0.5s ease;
}

.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
}
</style>


