import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
import {findSongIndex} from 'common/js/song'
import * as types from '../mutation-type'

const state = {
  playingStatus: false,         // 播放状态
  fullScreen: false,            // 播放器放大缩小状态
  playlist: [],                 // 播放列表
  sequenceList: [],             // 顺序播放列表
  playMode: playMode.sequence,  // 播放模式
  currentIndex: 0               // 单曲歌曲索引
}

const getters = {
  playingStatus: state => state.playingStatus,
  fullScreen: state => state.fullScreen,
  playlist: state => state.playlist,
  sequenceList: state => state.sequenceList,
  playMode: state => state.playMode,
  currentSong: (state) => {
    return state.playlist[state.currentIndex] || {}
  },
  currentIndex: state => state.currentIndex
}

const actions = {
  selectPlay({commit, state}, {list, index}) {
    commit(types.SET_SEQUENCE_LIST, list);
    if (state.playMode === playMode.random) {
      let randomList = shuffle(list);
      index = findSongIndex(randomList, list[index])
      list = randomList;
    }
    commit(types.SET_PLAYLIST, list);
    commit(types.SET_CURRENT_INDEX, index);
    commit(types.SET_FULL_SCREEN, true);
    commit(types.SET_PLAYING_STATUS, true);
  },

  randomPlay({commit, state}, {list}) {
    list = shuffle(list);
    commit(types.SET_PLAY_MODE, playMode.random);
    commit(types.SET_PLAYLIST, list);
    commit(types.SET_CURRENT_INDEX, 0);
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
    state.playMode = playMode;
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
