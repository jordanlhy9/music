import * as types from '../mutation-type'

const state = {
  singer: {}
}

const getters = {
  singer: state => state.singer
}

const mutations = {
  [types.SET_SINGER] (state, singer) {
    state.singer = singer
  }
}

export default {
  state,
  getters,
  mutations
}
