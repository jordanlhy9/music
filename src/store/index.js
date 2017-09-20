import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import singer from './modules/singer'
import player from './modules/player'
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  actions,
  getters,
  modules: {
    singer,
    player
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
