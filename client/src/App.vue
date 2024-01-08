<template>
  <div class="container min-vh-100">
    <div class="d-flex min-vh-100 flex-column justify-content-evenly align-items-center">
      <img class="w-lg-50 w-100 my-2" src="@/assets/images/logo.png" :alt="$t('strikeOrSike')" />
      <router-view class="mt-2 mb-5" />
      <portal-target name="banner" class="mb-2" />
    </div>
  </div>
</template>

<script lang="ts">
import { PortalTarget } from 'portal-vue'
import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    PortalTarget
  }
})
</script>

<style lang="scss">
@import '@/styles/app';
</style>
