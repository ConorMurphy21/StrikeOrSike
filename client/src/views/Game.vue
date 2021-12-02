<script setup>
import Lobby from '@/components/lobby/Lobby.vue'
import PromptResponse from '@/components/promptResponse/PromptResponse.vue'
import {useRouter} from 'vue-router'
import {useStore} from 'vuex'

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
    <lobby v-if="scene === 'lobby'" />
    <prompt-response v-if="scene === 'promptResponse'" />
  </div>
</template>

<script>
import {createNamespacedHelpers} from "vuex";
const { mapState } = createNamespacedHelpers('game')

export default {
  computed: {
    ...mapState([
        'scene'
    ])
  }
}
</script>

