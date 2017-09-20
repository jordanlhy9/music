import {playMode} from 'common/js/config'
import * as types from '../mutation-type'

const state = {
  playingStatus: false,
  fullScreen: false,
  playlist: [],
  sequenceList: [],
  playMode: playMode.sequence,
  currentIndex: 0
}

const getters = {
  playingStatus: state => state.playingStatus,
  fullScreen: state => state.fullScreen,
  playlist: state => state.playlist,
  sequenceList: state => state.sequenceList,
  palyMode: state => state.playMode,
  currentSong: (state) => {
    return state.playlist[state.currentIndex] || {}
  },
  currentIndex: state => state.currentIndex
}

const actions = {
  selectPlay({commit, state}, {list, index}) {
    commit(types.SET_SEQUENCE_LIST, list);
    commit(types.SET_PLAYLIST, list);
    commit(types.SET_CURRENT_INDEX, index);
    commit(types.SET_FULL_SCREEN, true);
    commit(types.SET_PLAYING_STATUS, true);
  }
}

const mutations = {
  [types.SET_PLAYING_STATUS] (state, playingStatus) {
    state.playingStatus = playingStatus;
  },
  [types.SET_FULL_SCREEN] (state, fullScreen) {
    state.fullScreen = fullScreen;
  },
  [types.SET_PLAYLIST] (state, playlist) {
    state.playlist = playlist;
  },
  [types.SET_SEQUENCE_LIST] (state, sequenceList) {
    state.sequenceList = sequenceList;
  },
  [types.SET_PLAY_MODE] (state, playMode) {
    state.palyMode = playMode;
  },
  [types.SET_CURRENT_INDEX] (state, currentIndex) {
    state.currentIndex = currentIndex
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
