export { default as assert } from "http-assert"
//import { cerveza } from "cerveza";
import { mergeObjects } from "json-merger";
/**
 * Deep merge conf objects
 * @param  {object} ...objects conf objects to merge
 * @returns {object} merged conf object
 */
export function mergeConf(...objects) {
  return mergeObjects(toFlatArray(objects))
}

export function toValue(fn, ...args) {
  if (typeof fn === 'function') return fn(...args);
  return fn
}

export function toValueOn(target, fn, ...args) {
  if (typeof fn === 'function') return fn.call(target, ...args);
  return fn
}

export function toFunction(fn) {
  if (typeof fn === 'function') return fn;
  return () => fn
}

export function toFunctionOn(target, fn) {
  if (typeof fn === 'function') return fn.bind(target);
  return () => fn
}

var lineCounter = 0;
export function report(...args) {
  lineCounter++
  if (lineCounter % 2) {
    return console['log']('\x1b[33m', ...args, '\x1b[0m')
  } else {
    return console['log']('\x1b[32m', ...args, '\x1b[0m')
  }
}

export function reportAgain(...args) {
  lineCounter--
  report(...args)
}

/**
 * Get items of array or object sorted according to a function applied to each item 
 * @param  {array} arr an array or object to sort
 * @param  {function} fn the items in arr will be sorted by fn(item)
 * @returns {array} sorted array
 */
export function sortBy(arr, fn) {
  if (Array.isArray(arr)) return Object.values(arr)
    .map((v, k) => [fn(v, k), v])
    .sort(([a], [b]) => a > b ? 1 : a < b ? -1 : 0)
    .map(([s, v]) => v)
  return Object.fromEntries(sortBy(Object.entries(arr), v => fn(v[1], v[0])))
}
/**
 * @param  {any} ...items 
 * @returns {array} a flat array, with null and undefined values removed
 */
export function toFlatArray(...items) {
  return [].concat(items)
    .flat(Infinity)
    .filter(x => (x ?? null) !== null)
}
/**
 * @returns {string} a random string
 */
export function randomString() {
  return Math.random().toString(36).substring(2, 12) + '-' + Math.random().toString(36).substring(2, 12)
}

export function callbackify(fn) {
  return async (...args) => {
    const cb = args.pop()
    try {
      let res = await fn(...args);
      cb(null, res)
    } catch (e) {
      cb(e)
    }
  }
}

export function promisify(fn) {
  return (...args) => {
    args = args.slice(0, fn.length - 1)
    return new Promise(resolve => fn(...args, (err, res) => {
      if (err) throw err;
      resolve(res)
    }))
  }
}
export function splitKeys(obj, sep = ',') {
  let ret = {}
  for (const key in obj) {
    let keys = String(key).split(sep).map(x => x.trim()).filter(Boolean);
    for (const id of keys) {
      ret[id] = obj[key]
    }
  }
  return ret;
}

export function mapKeys(obj, fn) {
  let ret = {}
  for (const key in obj) {
    let id = fn(key, obj[key])
    ret[id] = obj[key]
  }
  return ret;
}

export function fixPath(path, prefix = false, suffix = false) {
  let fixed = toFlatArray(path).join('/').split('/').filter(Boolean).join('/')
  if (suffix && fixed) fixed += '/'
  if (prefix) fixed = '/' + fixed
  return fixed
}

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function parseRoute(route) {
  route = fixPath(route)
  let bits = route.split('/').map(part => {
    let [m, m1, m2] = part.match(/^\[(\.\.\.)?(\w+)\]$/) || []
    if (!m) return part
    if (!m1) return `(?<${escapeRegExp(m2)}>[^/]+)`
    return `:${m2}*`
  })
  return new RegExp('^([/]' + bits.join('[/]') + ')[/]?$');
}

export function compileRoute(route) {
  route = fixPath(route)
  let bits = route.split('/').map(part => {
    let [m, m1, m2] = part.match(/^\[(\.\.\.)?(\w+)\]$/) || []
    if (!m) return part
    if (!m1) return `:${m2}`
    return `:${m2}*`
  })
  return '/' + bits.join('/')
}


export function stamp(def, specs) {
  specs = specs.filter(x => x?.constructor == Object)
  const ret = {}
  for (const [id, rule] of Object.entries(def)) {

    const arr = toFlatArray(specs.map(x => x[id]))

    if (typeof rule == 'object') {
      ret[id] = stamp(rule, arr)
      continue;
    }
    ret[id] = rule(arr)
  }
  return ret
}

Object.assign(stamp, {
  ALL: arr => [...arr],
  LAST: arr => arr.get(-1),
  ASSIGN: arr =>Object.assign({}, ...arr),
  MERGE: arr => mergeConf(...arr),
  PROPS: arr=> Object.assign({}, ...arr.map(Object.getOwnPropertyDescriptors)),
  CALLER: arr => async function(args) {
    for (const each of arr) {
     await each.call(this,{ ...this.conf, ...args })
    }
  },
  ASSIGNER: arr => async function(args) {
    let ret = {};
    for (const each of arr) {
      Object.assign(ret,await toValueOn(this,each))
    }
    return ret;
  },
})

/*


export const stamp2 = cerveza().define({
  ALL: arr => [...arr],
  LAST: arr => arr.get(-1),
  ASSIGN: arr =>Object.assign({}, ...arr),
  MERGE: arr => mergeConf(...arr),
  PROPS: arr=> Object.assign({}, ...arr.map(Object.getOwnPropertyDescriptors)),
  CALLER: arr => async function(args) {
    for (const each of arr) {
     await each.call(this,{ ...this.conf, ...args })
    }
  },
  ASSIGNER: arr => async function(args) {
    let ret = {};
    for (const each of arr) {
      Object.assign(ret,await toValueOn(this,each))
    }
    return ret;
  }
})

*/