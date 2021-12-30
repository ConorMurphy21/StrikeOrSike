<template>
  <div class="w-75 h-100 border rounded">
    <form class="form" v-on:submit.prevent="onSubmit">
      <input type="radio" class="btn-check" name="options" :value="true" id="join-game" v-model="joinGame">
      <label class="btn btn-primary" for="join-game">join game</label>
      <input type="radio" class="btn-check" name="options" :value="false" id="create-game" v-model="joinGame">
      <label class="btn btn-primary" for="create-game">create game</label> <br>

      <label for="username" class="form-label">Name</label>
      <input type="text" class="form-control" id="username" placeholder="your name" v-model="form.name" autofocus>
      <label for="room-name" class="form-label">Room Name</label>
      <input type="text" class="form-control" id="room-name" placeholder="room name" v-model="form.roomName">

      <!-- Can use either 2 methods to get localization, one looks better, one is faster -->
      <h4 v-if="error" v-t="error"></h4>
      <!-- <h4 v-if="error">{{$t(error)}}</h4> -->

      <button type="submit" class="btn btn-primary">{{ joinGame ? 'join game' : 'create game' }}</button>
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

