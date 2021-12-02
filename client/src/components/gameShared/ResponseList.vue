<template>
  <ul>
    <li v-for="response in responses">
      {{response}}
    </li>
  </ul>
</template>
<script>
import {createNamespacedHelpers} from "vuex";
const {mapState} = createNamespacedHelpers('game')

export default {
  computed: {
    ...mapState([
      'responses'
    ])
  }
}
</script>

