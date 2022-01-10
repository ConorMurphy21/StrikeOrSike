<template>
  <div class="w-50 border-boi bg-secondary p-5">
    <form class="form" @submit.prevent="onSubmit(true)">

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

      <div class="d-flex flex-row justify-content-around align-items-center">
        <button type="submit" class="btn btn-sike w-25">Join Game</button>
        <button @click="onSubmit(false)" class="btn btn-strike w-25">Create Game</button>
      </div>
    </form>
  </div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex'

const {mapMutations} = createNamespacedHelpers('room')

export default {
  data() {
    return {
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
    onSubmit(joinGame) {
      const event = joinGame ? 'joinRoom' : 'createRoom';
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
  //border: 5px solid $gray-400;
  border-radius: 15px;
  box-shadow: 7px 7px 5px 2px $gray-400;
}

input {
  background-color: $primary;
  color: $sike !important;
  font-size: 20px;
  font-weight: bold;
}

input:focus {
  background-color: $primary;
}
</style>

