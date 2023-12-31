<template>
  <div class="main-content w-93 w-lg-50 px-3 px-lg-5 py-3 py-lg-4" :class="{'shake': receivedError}">
    <form class="form" @submit.prevent="onSubmit(true)">

      <h4 class="mb-1 text-center text-red fs-4" v-if="error" v-t="error"/>

      <div class="mb-3">
        <label for="username" class="form-label" v-t="'usernameLabel'"/>
        <input type="text" class="form-control" id="username" ref="username"
               :placeholder="$t('usernamePlaceholder')" v-model="form.name">
      </div>

      <div class="mb-3">
        <label for="room-name" class="form-label" v-t="'roomNameLabel'"/>
        <input type="text" class="form-control" id="room-name"
               :placeholder="$t('roomNamePlaceholder')" v-model="form.roomName">
      </div>

      <div class="d-flex flex-column flex-lg-row justify-content-around align-items-center mt-5 mb-3 gap-3">
        <button type="submit" class="btn btn-blue w-100" v-t="'joinGame'"/>
        <button type="button" @click="onSubmit(false)" class="btn btn-red w-100" v-t="'createGame'"/>
      </div>

      <div class="d-flex flex-column justify-content-between align-items-center">
        <router-link class="row text-center fs-5" to="/about" v-t="'about.link'"/>
        <router-link class="row text-center link-blue fs-5" to="/how-to-play" v-t="'howToPlayLink'"/>
        <a href="https://www.buymeacoffee.com/ConorMurphy/" class="row text-center fs-4 link-dark font-fancy">
          <div class="d-flex align-items-center justify-content-center gap-1">
            <img :alt="$t('coffeeAlt')" src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
                 height="25">
            <span v-t="'coffeeLink'"/>
            <img :alt="$t('coffeeAlt')" src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
                 height="25">
          </div>
        </a>
      </div>
    </form>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import ClickMp3 from '@/assets/audio/click2.mp3'
import {AudioWrap} from '@/mixins/audiowrap';
import socket from '@/socket/socket';

const click = new AudioWrap(ClickMp3);

const {mapMutations, mapState} = createNamespacedHelpers('room');

export default {
  data() {
    return {
      form: {
        name: '',
        roomName: this.$route.query.name ?? ''
      },
    }
  },
  mounted() {
    if (this.$route.query.error) {
      this.setError(this.$route.query.error);
    }
    this.$refs.username.focus();
    this.$store.reset();
  },
  computed: {
    ...mapState([
      'error',
      'receivedError'
    ])
  },
  methods: {
    ...mapMutations([
      'setName',
      'setRoomName',
      'setError',
    ]),
    onSubmit(joinGame) {
      click.play();
      const event = joinGame ? 'joinRoom' : 'createRoom';
      this.setName(this.form.name);
      socket.emit(event, this.form.name, this.form.roomName, navigator.languages);
    }
  }
}
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

