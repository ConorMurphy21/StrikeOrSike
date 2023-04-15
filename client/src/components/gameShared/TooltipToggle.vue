<template>
  <button class="text-black"
          :class="{'bi-lightbulb': showTooltips,'bi-lightbulb-off': !showTooltips }"
          @click="click"
          v-tooltip.left.ds250="$t('tooltip.showTooltips')"
  />
</template>
<script>
import {createNamespacedHelpers} from 'vuex';

const {mapState, mapMutations} = createNamespacedHelpers('settings');
export default {
  computed: {
    ...mapState([
      'showTooltips'
    ]),
  },
  methods: {
    ...mapMutations([
      'setShowTooltips'
    ]),
    click() {
      this.setShowTooltips(!this.showTooltips);
    },
  }
}
</script>

<style scoped lang="scss">

button {
  font-size: 40px;
  background: none;
  border: none;
  outline: none;
}

button:hover {
  text-shadow: 0 0 18px yellow;
  cursor: pointer;
}

button:focus {
  text-shadow: 0 0 18px yellow;
  cursor: pointer;
}

</style>