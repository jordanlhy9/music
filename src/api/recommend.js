import {commonParams, options} from './config.js'
import jsonp from 'common/js/jsonp.js'
import axios from 'axios'

// 推荐
export function getRecommend() {
  const url = '/api/getRecommend';

  const data = Object.assign({}, commonParams, {
    needNewCode: 1
  });

  return axios.get(url, {
    params: data
  }).then((response) => {
    return Promise.resolve(response.data)
  })
}

// 热门歌单
export function getDissList() {
  const url = '/api/getDissList';

  const data = Object.assign({}, commonParams, {
    g_tk: 5381,
    jsonpCallback: 'getPlaylist',
    platform: 'yqq',
    hostUin: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    needNewCode: 0,
    categoryId: 10000000,
    rnd: Math.random(),
    format: 'json'
  })

  return axios.get(url, {
    params: data
  }).then((response) => {
    return Promise.resolve(response.data)
  })
}

// 歌曲列表
export function getSongList(disstid) {
  const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg';

  const data = Object.assign({}, commonParams, {
    disstid,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0
  })

  return jsonp(url, data, options)
}
