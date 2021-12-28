<script setup>
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
    <component :is="scene"></component>
  </div>
</template>

<script>
import Lobby from '@/components/lobby/Lobby.vue'
import PromptResponse from '@/components/promptResponse/PromptResponse.vue'
import ActiveSelection from '@/components/responseSelection/ActiveSelection.vue';
import PassiveSelection from '@/components/responseSelection/PassiveSelection.vue';
import ActiveDispute from "@/components/dispute/ActiveDispute.vue";
import PassiveDispute from '@/components/dispute/PassiveDispute.vue';
import ActiveMatching from '@/components/responseMatching/ActiveMatching.vue';
import MatchingSummary from '@/components/responseMatching/MatchingSummary.vue';

import {createNamespacedHelpers} from 'vuex';

const { mapState } = createNamespacedHelpers('game')

export default {
  components:{
    Lobby,
    PromptResponse,
    ActiveSelection,
    PassiveSelection,
    ActiveDispute,
    PassiveDispute,
    ActiveMatching,
    MatchingSummary,
  },
  computed: {
    ...mapState([
        'scene'
    ])
  }
}
</script>

