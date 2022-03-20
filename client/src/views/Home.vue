<template>
  <div class="main-content w-75 w-lg-50 p-3 p-lg-5">
    <form class="form" @submit.prevent="onSubmit(true)">

      <h4 class="mb-3 text-center text-red fs-4" v-if="error" v-t="error"/>

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

      <div class="d-flex flex-column flex-lg-row justify-content-around align-items-center mt-5 mb-4 gap-3">
        <button type="submit" class="btn btn-blue w-100" v-t="'joinGame'"/>
        <button type="button" @click="onSubmit(false)" class="btn btn-red w-100" v-t="'createGame'"/>
      </div>

      <div class="row">
        <router-link class="col text-center fs-4" to="/how-to-play" v-t="'howToPlayLink'"/>
        <router-link class="col text-center link-blue fs-4" to="/about" v-t="'aboutLink'"/>
      </div>
    </form>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
import ClickMp3 from '@/assets/audio/click2.mp3'

const click = new Audio(ClickMp3);

const {mapMutations} = createNamespacedHelpers('room');

export default {
  data() {
    return {
      form: {
        name: '',
        roomName: this.$route.query.name ?? ''
      },
      error: this.$route.query.error
    }
  },
  mounted() {
    this.$refs.username.focus();
    this.$store.reset();
  },
  methods: {
    ...mapMutations([
      'setName',
      'setRoomName'
    ]),
    onSubmit(joinGame) {
      click.play()
      const event = joinGame ? 'joinRoom' : 'createRoom';
      this.$socket.emit(event, this.form.name, this.form.roomName, navigator.languages);
    }
  },
  sockets: {
    joinRoom: function (data) {
      if (data.success) {
        this.setName(this.form.name);
        this.setRoomName(data.roomName);
        this.$router.push({name: 'game', params: {roomName: data.roomName}});
      } else {
        this.error = data.error;
      }
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

