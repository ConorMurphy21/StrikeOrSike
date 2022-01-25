<template>
  <div class="main-content w-50 p-5">
    <form class="form" @submit.prevent="onSubmit(true)">

      <h4 class="mb-3" v-if="error" v-t="error"/>

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

      <div class="d-flex flex-row justify-content-around align-items-center mt-5">
        <button type="submit" class="btn btn-blue" v-t="'joinGame'"/>
        <button type="button" @click="onSubmit(false)" class="btn btn-red" v-t="'createGame'"/>
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
    this.$store.reset();
  },
  methods: {
    ...mapMutations([
      'setName',
      'setRoomName'
    ]),
    onSubmit(joinGame) {
      const event = joinGame ? 'joinRoom' : 'createRoom';
      this.$socket.emit(event, this.form.name, this.form.roomName, navigator.languages);
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
  color: $red;
  font: inherit;
  font-size: 1.6rem;
}

.btn {
  width: 30%;
  min-width: 150px;
  height: 60px;
}
</style>

