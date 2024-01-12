import App from './App.vue';
import { createApp } from 'vue';
import pinia from './stores';
import i18n from './locales';
import router from './router';
import { CBSTooltip } from './directives/tooltip';
import PortalVue from 'portal-vue';

// only import bootstrap components that are used
import { Collapse, Dropdown } from 'bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useGameStore } from '@/stores/game.js';
import { useRoomStore } from '@/stores/room.js';
import socket from '@/socket/socket.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(i18n);
app.use(PortalVue);
app.directive('tooltip', CBSTooltip);

// bind socket io to pinia
const room = useGameStore();
const game = useRoomStore();
socket.off();
room.bindEvents();
game.bindEvents();

void router.isReady().then(() => {
  app.mount('#app');
});
