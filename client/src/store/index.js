import { createStore, createLogger } from 'vuex'
import game from './modules/game'
import room from './modules/room'

const debug = process.env.NODE_ENV !== 'production'

export default createStore({
    modules: {
        game,
        room
    },
    strict: debug,
    plugins: debug ? [createLogger()] : []
})