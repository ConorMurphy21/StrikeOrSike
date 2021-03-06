import App from './App.vue'
import { createApp } from 'vue'
import store from './store'
import i18n from './locales'
import router from './router'
import VueSocketIO from 'vue-3-socket.io'

// only import bootstrap components that are used
import {Collapse} from 'bootstrap';

const debug = process.env.NODE_ENV !== 'production'
//const debug = true

const app = createApp(App)

app.use(store)
app.use(router)
app.use(i18n)


router.isReady().then(() => {
    app.use(new VueSocketIO({
        debug,
        connection: debug ? 'http://localhost:5000' : location.origin, //options object is Optional
        options: {withCredentials: false},
        vuex: {
            store,
            actionPrefix: 'SOCKET_',
            mutationPrefix: 'SOCKET_'
        }
    }))
    app.mount('#app')
})
