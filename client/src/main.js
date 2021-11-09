import App from './App.vue'
import { createApp } from 'vue'
import { createStore } from 'vuex'
//import store from './store'
import router from './router'
import VueSocketIO from 'vue-3-socket.io'
import 'bootstrap/dist/css/bootstrap.css'

// Create a new store instance.
const store = createStore({
    state () {
        return {
            count: 0
        }
    },
    mutations: {
        increment (state) {
            state.count++
        }
    }
})

const app = createApp(App)

app.use(store)
app.use(router)
app.use(new VueSocketIO({
    debug: true,
    connection: 'http://localhost:3000', //options object is Optional
    options: {withCredentials: false},
    vuex: {
        store,
        actionPrefix: "SOCKET_",
        mutationPrefix: "SOCKET_"
    }
}))
app.mount('#app')
