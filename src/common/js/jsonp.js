import originJsonp from 'jsonp'

export default function jsonp(url, data, option) {
  url += (url.indexOf('?') > -1 ? '&' : '?') + params(data);

  return new Promise((resolve, reject) => {
    originJsonp(url, option, (err, data) => {
      if (!err) {
        resolve(data);
      } else {
        reject(err);
      }
    })
  })
}

function params(data) {
  let params = [];
  for (let k in data) {
    params.push(k + '=' + (data[k] !== undefined ? encodeURIComponent(data[k]) : ''));
  }
  return params.join('&');
}
