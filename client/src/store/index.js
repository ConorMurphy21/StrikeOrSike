import {createStore} from 'vuex-extensions';
import Vuex from 'vuex';
import game from './modules/game';
import room from './modules/room';

const debug = process.env.NODE_ENV !== 'production'

export default createStore(Vuex.Store,{
    modules: {
        game,
        room
    },
    strict: debug,
    plugins: debug ? [Vuex.createLogger()] : []
});