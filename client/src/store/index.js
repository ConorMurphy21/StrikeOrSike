import {createStore} from 'vuex-extensions';
import Vuex from 'vuex';
import game from './modules/game';
import room from './modules/room';
import settings from './modules/settings';

const debug = process.env.NODE_ENV !== 'production'

export default createStore(Vuex.Store,{
    modules: {
        game,
        room,
        settings
    },
    strict: debug,
    plugins: debug ? [Vuex.createLogger()] : []
});