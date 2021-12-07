<script setup>
import ResponseList from "@/components/gameShared/ResponseList.vue";
import SelectionType from "@/components/selection/SelectionType.vue";
</script>

<template>
  <div class="w-100 h-100 d-flex flex-column justify-content-between align-items-center p-3">
    <h1>{{ prompt }}</h1>
    <h2> active </h2>
    <selection-type/>
    <response-list/>
  </div>
</template>

<script>
import {createNamespacedHelpers} from "vuex";

const {mapState} = createNamespacedHelpers('game');

export default {
  data() {
    return {
      response: ''
    }
  },
  computed: {
    ...mapState([
      'prompt',
    ])
  },
  methods: {}
}
</script>
