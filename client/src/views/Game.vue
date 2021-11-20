<script setup>
import Lobby from '@/components/lobby/Lobby.vue'
import {useStore} from "vuex";
import {useRouter} from 'vue-router'
import {defineProps} from 'vue'
const store = useStore()
const router = useRouter()

const props = defineProps({
  roomName: String
})

if(!store.state.room.roomName){
  router.push({name: 'home', query: {name: props.roomName}})
}
</script>

<template>
  <div class="w-75 h-100 border rounded">
    <lobby/>
  </div>
</template>


