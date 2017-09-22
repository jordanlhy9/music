// 打乱数组顺序
export function shuffle(arr) {
  let _arr = arr.slice();
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i);
    let t = _arr[i];
    _arr[i] = _arr[j];
    _arr[j] = t;
  }
  return _arr;
}

// 生成min到max之间的随机数
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// HTML实体编码转换
export function htmlDecode(str) {
  var t = document.createElement('div');
  t.innerHTML = str;
  return t.textContent || t.innerText;
}
