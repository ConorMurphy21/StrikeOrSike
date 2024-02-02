<script setup lang="ts">
import { Instance } from '@popperjs/core';
import { onMounted, reactive, type Ref, ref } from 'vue';
import ClickMp3 from '@/assets/audio/click2.mp3';
import { AudioWrap } from '@/mixins/audiowrap';
import { useGameStore } from '@/stores/game.js';
import { useRoomStore } from '@/stores/room.js';
import { useRoute } from 'vue-router';
import socket from '@/socket/socket';
const click = new AudioWrap(ClickMp3);

const route = useRoute();
const form = reactive({ name: '', roomName: (route.query.name as string) ?? '' });

const usernameInput: Ref<InstanceType<typeof HTMLInputElement> | null> = ref(null);

const roomStore = useRoomStore();

onMounted(() => {
  if (route.query.error) {
    roomStore.setError(route.query.error as string);
  }
  if (usernameInput.value) {
    usernameInput.value.focus();
  }
  useGameStore().$reset();
});

function onSubmit(joinGame: boolean) {
  click.play();
  const event = joinGame ? 'joinRoom' : 'createRoom';
  roomStore.setName(form.name);
  socket.emit(event, form.name, form.roomName, navigator.languages);
}
</script>

<template>
  <div class="main-content w-93 w-lg-50 px-3 px-lg-5 py-3 py-lg-4" :class="{ shake: roomStore.receivedError }">
    <form class="form" @submit.prevent="onSubmit(true)">
      <h4 v-if="roomStore.error" v-t="roomStore.error" class="mb-1 text-center text-red fs-4" />

      <div class="mb-3">
        <label v-t="'usernameLabel'" for="username" class="form-label" />
        <input
          id="username"
          ref="usernameInput"
          v-model="form.name"
          type="text"
          class="form-control"
          :placeholder="$t('usernamePlaceholder')" />
      </div>

      <div class="mb-3">
        <label v-t="'roomNameLabel'" for="room-name" class="form-label" />
        <input
          id="room-name"
          v-model="form.roomName"
          type="text"
          class="form-control"
          :placeholder="$t('roomNamePlaceholder')" />
      </div>

      <div class="d-flex flex-column flex-lg-row justify-content-around align-items-center mt-5 mb-3 gap-3">
        <button v-t="'joinGame'" type="submit" class="btn btn-blue w-100" />
        <button v-t="'createGame'" type="button" class="btn btn-red w-100" @click="onSubmit(false)" />
      </div>

      <div class="d-flex flex-column justify-content-between align-items-center">
        <router-link v-t="'about.link'" class="row text-center fs-5" to="/about" />
        <router-link v-t="'howToPlayLink'" class="row text-center link-blue fs-5" to="/how-to-play" />
        <a href="https://www.buymeacoffee.com/ConorMurphy/" class="row text-center fs-4 link-dark font-fancy">
          <div class="d-flex align-items-center justify-content-center gap-1">
            <img :alt="$t('coffeeAlt')" src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" height="25" />
            <span v-t="'coffeeLink'" />
            <img :alt="$t('coffeeAlt')" src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" height="25" />
          </div>
        </a>
      </div>
    </form>
  </div>
</template>

<style lang="scss" scoped>
input {
  background-color: $orange;
  color: $gray-800 !important;
  text-align: center;
  height: 70px;
}

input::placeholder {
  color: $gray-700;
}

input:focus {
  background-color: $orange;
}

.btn {
  height: 60px;
}

a {
  text-decoration: none;
}

a:hover {
  text-decoration: 2px underline;
}
</style>
