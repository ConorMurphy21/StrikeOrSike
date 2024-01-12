<template>
  <div
    class="main-content w-93 w-lg-50 px-3 px-lg-5 py-3 py-lg-4"
    :class="{ shake: receivedError }">
    <form class="form" @submit.prevent="onSubmit(true)">
      <h4 v-if="error" v-t="error" class="mb-1 text-center text-red fs-4" />

      <div class="mb-3">
        <label v-t="'usernameLabel'" for="username" class="form-label" />
        <input
          id="username"
          ref="username"
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

      <div
        class="d-flex flex-column flex-lg-row justify-content-around align-items-center mt-5 mb-3 gap-3">
        <button v-t="'joinGame'" type="submit" class="btn btn-blue w-100" />
        <button
          v-t="'createGame'"
          type="button"
          class="btn btn-red w-100"
          @click="onSubmit(false)" />
      </div>

      <div
        class="d-flex flex-column justify-content-between align-items-center">
        <router-link
          v-t="'about.link'"
          class="row text-center fs-5"
          to="/about" />
        <router-link
          v-t="'howToPlayLink'"
          class="row text-center link-blue fs-5"
          to="/how-to-play" />
        <a
          href="https://www.buymeacoffee.com/ConorMurphy/"
          class="row text-center fs-4 link-dark font-fancy">
          <div class="d-flex align-items-center justify-content-center gap-1">
            <img
              :alt="$t('coffeeAlt')"
              src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
              height="25" />
            <span v-t="'coffeeLink'" />
            <img
              :alt="$t('coffeeAlt')"
              src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
              height="25" />
          </div>
        </a>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ClickMp3 from "@/assets/audio/click2.mp3";
import { AudioWrap } from "@/mixins/audiowrap";
import socket from "@/socket/socket";
import { mapState, mapActions } from "pinia";
import { useRoomStore } from "@/stores/room.js";
import { useGameStore } from "@/stores/game.js";
import { Instance } from "@popperjs/core";
const click = new AudioWrap(ClickMp3);

export default defineComponent({
  data() {
    return {
      form: {
        name: "",
        roomName: this.$route.query.name ?? "",
      },
    };
  },
  computed: {
    ...mapState(useRoomStore, ["error", "receivedError"]),
  },
  mounted() {
    if (this.$route.query.error) {
      this.setError(this.$route.query.error as string);
    }
    (this.$refs.username as InstanceType<typeof HTMLInputElement>).focus();
    useGameStore().$reset();
  },
  methods: {
    ...mapActions(useRoomStore, ["setName", "setRoomName", "setError"]),
    onSubmit(joinGame: boolean) {
      click.play();
      const event = joinGame ? "joinRoom" : "createRoom";
      this.setName(this.form.name);
      socket.emit(
        event,
        this.form.name,
        this.form.roomName,
        navigator.languages,
      );
    },
  },
});
</script>

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
