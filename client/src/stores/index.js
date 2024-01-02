import socket from '@/socket/socket';
import createWebSocketPlugin from '@/socket/webSocketStorePlugin';
import { PiniaLogger } from 'pinia-logger';
import { createPinia } from 'pinia';

const pinia = createPinia();

pinia.use(
  PiniaLogger({
    disabled: process.env.PROD
  })
);

const socketPlugin = createWebSocketPlugin(socket);
pinia.use(socketPlugin);

export default pinia;
