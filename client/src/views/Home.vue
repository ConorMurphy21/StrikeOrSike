

<template>
  <div class="container">
    <form class="form" v-on:submit.prevent="onSubmit">
      <input type="radio" class="btn-check" name="options" v-bind:value="true" id="join-game" v-model="joinGame">
      <label class="btn btn-primary" for="join-game">join game</label>
      <input type="radio" class="btn-check" name="options" v-bind:value="false" id="create-game" v-model="joinGame">
      <label class="btn btn-primary" for="create-game">create game</label> <br>

      <label for="username" class="form-label">Name</label>
      <input type="text" class="form-control"  id="username" placeholder="your name" v-model="form.name">
      <label for="room-name" class="form-label">Room Name</label>
      <input type="text" class="form-control"  id="room-name" placeholder="room name" v-model="form.roomName">

      <button type="submit" class="btn btn-primary">{{joinGame ? 'join game' : 'create game'}}</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data(){
    return{
      joinGame: false,
      form: {
        name: '',
        roomName: ''
      }
    }
  },
  methods:{
    onSubmit(){
      if(this.joinGame){
        axios.post('/api/join_game', this.form)
            .then(response => {
              if(response.status === 200){
                //this.$socket.connect({query: this.form})
                this.$router.push({name: 'game', params: {roomName: this.form.roomName}})
              }
            })
      } else {
        axios.post('/api/create_game', this.form)
            .then(response => {
              if(response.status === 200){
                this.$router.push({name: 'game', params: {roomName: this.form.roomName}})
              }
            })
      }
    }
  }
}
</script>