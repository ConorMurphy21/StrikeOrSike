<script setup lang="ts">
import { PortalTarget } from 'portal-vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';
const { t } = useI18n();
import ClickMp3 from '@/assets/audio/click2.mp3';
import { AudioWrap } from '@/mixins/audiowrap';

const click = new AudioWrap(ClickMp3);
const route = useRoute();
const router = useRouter();

const canNavigateHome = computed<boolean>(() => {
  return route.name !== 'game' && route.name !== 'home';
});
function onLogoClick() {
  if (canNavigateHome.value) {
    click.play();
    void router.push('home');
  }
}
</script>

<template>
  <div class="container min-vh-100">
    <div class="d-flex min-vh-100 flex-column justify-content-evenly align-items-center">
      <img
        class="w-lg-50 w-100 my-2"
        src="@/assets/images/logo.png"
        :alt="t('strikeOrSike')"
        :role="canNavigateHome ? 'button' : ''"
        @click="onLogoClick" />
      <router-view class="mt-2 mb-5" />
      <portal-target name="banner" class="mb-2" />
    </div>
  </div>
  <portal-target name="modal" />
</template>

<style lang="scss">
@import '@/styles/app';
</style>
