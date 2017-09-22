import {commonParams} from './config'
import axios from 'axios'

export function getLyric(id) {
  const url = '/api/getLyric';

  const data = Object.assign({}, commonParams, {
    musicid: id,
    nobase64: 1,
    songtype: 0,
    format: 'json'
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
