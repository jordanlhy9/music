export function addClass(el, className) {
  if (hasClass(el, className)) {
    return;
  } else {
    let classNameList = el.className.split(' ');
    classNameList.push(className);
    el.className = classNameList.join(' ');
  }
}

function hasClass(el, className) {
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)');
  return reg.test(el.className)
}

export function getData(el, name) {
  const prefix = 'data-';
  return el.getAttribute(prefix + name);
}

// 获取浏览器支持的前缀
export function prefixStyle(style) {
  const el = document.createElement('div');

  const vendor = {
    standard: 'transform',
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform'
  }

  let prefix = '';

  // 遍历vendor,获取浏览器支持的前缀
  for (let key in vendor) {
    if (el.style[vendor[key]] !== undefined) {
      prefix = key;
    }
  }

  if (prefix === 'standard') {
    return style;
  }

  return prefix + style.charAt(0).toUpperCase() + style.substr(1);
}
