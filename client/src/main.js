import App from './App.vue';
import { createApp } from 'vue';
import store from './store';
import i18n from './locales';
import router from './router';
import { CBSTooltip } from './directives/tooltip';
import Portal from 'vue3-portal';
import { AudioWrap } from './mixins/audiowrap';

// only import bootstrap components that are used
import {Collapse, Dropdown} from 'bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const app = createApp(App);
app.use(store);
AudioWrap.store = store;
app.use(router);
app.use(i18n);
app.use(Portal);
app.directive('tooltip', CBSTooltip);

router.isReady().then(() => {
    app.mount('#app');
})
