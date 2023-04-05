import App from './App.vue';
import { createApp } from 'vue';
import store from './store';
import i18n from './locales';
import router from './router';
import {CBSTooltip} from './directives/tooltip';
import VueSocketIO from 'vue-3-socket.io';
import Portal from 'vue3-portal';

// only import bootstrap components that are used
import {Collapse, Dropdown} from 'bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const debug = process.env.NODE_ENV !== 'production';
//const debug = true

const app = createApp(App);
app.use(store);
app.use(router);
app.use(i18n);
app.use(Portal);

app.directive('tooltip', CBSTooltip);

const socket = new VueSocketIO({
    debug,
    connection: debug ? 'http://localhost:5000' : location.origin, //options object is Optional
    options: {withCredentials: false},
    vuex: {
        store,
        actionPrefix: 'SOCKET_',
        mutationPrefix: 'SOCKET_'
    }
});

store.$socket = socket;

router.isReady().then(() => {
    app.use(socket);
    app.mount('#app');
})
