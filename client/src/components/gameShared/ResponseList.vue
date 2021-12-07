<template>
  <div class="d-flex flex-column justify-content-center align-items-center w-75 h-100 m-2 m-3 overflow-auto">
    <div class="list-group  w-100 h-100">
      <div v-for="response in responses" class="list-group-item" :class="{'list-group-item-action': selectable}">
        {{ response }}
      </div>
    </div>
  </div>
</template>
<script>
import {createNamespacedHelpers} from "vuex";

const {mapState} = createNamespacedHelpers('game')

export default {
  props:{
    selectable: Boolean
  },
  computed: {
    ...mapState([
      'responses'
    ])
  }
}
</script>

