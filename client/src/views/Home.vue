<template>
  <div class="w-50 h-100 border-boi bg-secondary p-5">
    <form class="form" v-on:submit.prevent="onSubmit">
      <div class="mb-3">
        <input type="radio" class="btn-check" name="options" :value="true" id="join-game" v-model="joinGame">
        <label class="btn btn-strike w-25 mx-2" for="join-game">join game</label>
        <input type="radio" class="btn-check" name="options" :value="false" id="create-game" v-model="joinGame">
        <label class="btn btn-sike w-25 mx-2" for="create-game">create game</label> <br>
      </div>

      <div class="mb-3">
        <label for="username" class="form-label">Name</label>
        <input type="text" class="form-control" id="username" ref="username" placeholder="your name"
               v-model="form.name">
      </div>

      <div class="mb-3">
        <label for="room-name" class="form-label">Room Name</label>
        <input type="text" class="form-control" id="room-name" placeholder="room name" v-model="form.roomName">
      </div>

      <!-- Can use either 2 methods to get localization, one looks better, one is faster -->
      <h4 v-if="error" v-t="error"></h4>
      <!-- <h4 v-if="error">{{$t(error)}}</h4> -->

      <button type="submit" class="btn btn-strike w-25">{{ joinGame ? 'join game' : 'create game' }}</button>
    </form>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex'

const {mapMutations} = createNamespacedHelpers('room')

export default {
  data() {
    return {
      joinGame: true,
      form: {
        name: '',
        roomName: this.$route.query.name
      },
      error: this.$route.query.error
    }
  },
  mounted() {
    this.$refs.username.focus();
  },
  methods: {
    ...mapMutations([
      'setName',
      'setRoomName'
    ]),
    onSubmit() {
      const event = this.joinGame ? 'joinRoom' : 'createRoom';
      this.$socket.emit(event, this.form.name, this.form.roomName);
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
.border-boi {
  border: 7px solid $cyan;
  border-radius: 15px;
  box-shadow: 7px 7px 5px $gray-400;
}

input {
  background-color: $primary;
  color: $sike !important;
  font-size: 14px;
  font-weight: bold;
}

input:focus {
  background-color: $primary;
}
</style>

