import {commonParams,options} from './config'

export function getSong(){
  const url = '';

  const data = Object.assign({}, commonParams, {}
  )

  return jsonp(url, data, options)
}
