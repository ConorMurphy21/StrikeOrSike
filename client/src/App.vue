<script setup lang="ts">
import { PortalTarget } from 'portal-vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
  <div class="container min-vh-100">
    <div class="d-flex min-vh-100 flex-column justify-content-evenly align-items-center">
      <img class="w-lg-50 w-100 my-2" src="@/assets/images/logo.png" :alt="t('strikeOrSike')" />
      <router-view class="mt-2 mb-5" />
      <portal-target name="banner" class="mb-2" />
    </div>
  </div>
</template>

<style lang="scss">
@import '@/styles/app';
</style>
