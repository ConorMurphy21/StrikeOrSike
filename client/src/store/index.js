import {createStore} from 'vuex-extensions';
import Vuex from 'vuex';
import game from './modules/game';
import room from './modules/room';
import settings from './modules/settings';
import socket from '@/socket/socket';
import createWebSocketPlugin from '@/socket/webSocketStorePlugin';

const debug = process.env.NODE_ENV !== 'production';

const socketPlugin = createWebSocketPlugin(socket);

export default createStore(Vuex.Store,{
    modules: {
        game,
        room,
        settings
    },
    strict: debug,
    plugins: debug ? [Vuex.createLogger(), socketPlugin] : [socketPlugin]
});