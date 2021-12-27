<template>
  <h1>{{ type }}</h1>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';

const {mapState} = createNamespacedHelpers('game');

export default {
  computed: {
    ...mapState({
      type: 'selectionType'
    })
  },
}
</script>

