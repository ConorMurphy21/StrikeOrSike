import App from './App.vue'
import { createApp } from 'vue'
import store from './store'
import i18n from './locales'
import router from './router'
import VueSocketIO from 'vue-3-socket.io'
const debug = process.env.NODE_ENV !== 'production'

const app = createApp(App)

app.use(store)
app.use(router)
app.use(i18n)

app.use(new VueSocketIO({
    debug,
    connection: debug ? 'http://localhost:3000' : 'http://54.190.240.152', //options object is Optional
    options: {withCredentials: false},
    vuex: {
        store,
        actionPrefix: 'SOCKET_',
        mutationPrefix: 'SOCKET_'
    }
}))
router.isReady().then(() => {
    app.mount('#app')
})
