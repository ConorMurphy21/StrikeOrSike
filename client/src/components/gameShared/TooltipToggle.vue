<template>
  <button
    v-tooltip.left.ds250="$t('tooltip.showTooltips')"
    class="text-black"
    :class="{ 'bi-lightbulb': showTooltips, 'bi-lightbulb-off': !showTooltips }"
    @click="click" />
</template>
<script lang="ts">
import { useSettingsStore } from '@/stores/settings.js'
import { mapState, mapActions } from 'pinia'
import { defineComponent } from 'vue'

export default defineComponent({
  computed: {
    ...mapState(useSettingsStore, ['showTooltips'])
  },
  methods: {
    ...mapActions(useSettingsStore, ['setShowTooltips']),
    click() {
      this.setShowTooltips(!this.showTooltips)
      this.$forceUpdate()
    }
  }
})
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
