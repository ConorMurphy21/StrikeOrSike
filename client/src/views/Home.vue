<template>
  <div class="main-content w-50 p-5">
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
      <h4 v-if="error" v-t="error"/>
      <!-- <h4 v-if="error">{{$t(error)}}</h4> -->

      <div class="d-flex flex-row justify-content-around align-items-center mt-5">
        <button type="submit" class="btn btn-blue">Join Game</button>
        <button type="button" @click="onSubmit(false)" class="btn btn-red">Create Game</button>
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
      console.dir(data);
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

.main-content {
  min-width: 350px;
  width: 50%;
}

input {
  background-color: $primary;
  color: $gray-800 !important;
  text-align: center;
  height: 70px;
}

input::placeholder {
  color: $gray-700;
}

input:focus {
  background-color: $primary;
}

h4 {
  text-align: center;
}

.btn {
  width: 30%;
  min-width: 150px;
  height: 60px;
}


</style>

