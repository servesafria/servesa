
/**
 * Create a reducer.
 * @callback cbReducer
 * @param {any[]} values
 * @param {obj[]} objects
 */


/**
 * Create a reducer.
 * @callback cbCreateReducer
 * @param {any} [argument]
 * @return cbReducer
 */

const predefined = {
  all: () => arr => arr,
  override: (defaultValue) => arr => arr[arr.length - 1] ?? defaultValue,
  pick: (picker) => (
    typeof picker == 'string'
      ? (arr, objects) => objects.map(each => each[picker])
      : (arr, objects) => objects.map(picker)
  ),
  set: (value) => () => value,
  filter: fn => arr => arr.filter(fn),
  map: fn => arr => arr.map(fn),
  flat: arg => arr => arr.flat(arg),
  flatMap: fn => arr => arr.flatMap(fn),
  reduce: fn => arr => arr.reduce(fn),
  sort: fn => arr => arr.sort(fn)
}

const isVanillaObject = (obj) => obj && typeof obj === 'object' && Object.getPrototypeOf(obj) === Object.prototype

function getReducer(spec, named) {
  if (typeof spec === 'string') {
    if (!named[spec]) throw new Error('Invalid named reducer in cerveza:' + spec + '.')
    return named[spec]()
  }
  if (typeof spec === 'object') {
    let entries = Object.entries(spec);
    if (entries.length !== 1) throw new Error('Invalid reducer in cerveza.')
    let [name, arg] = entries[0];
    if (!named[name]) throw new Error('Invalid named reducer in cerveza:' + name + '.')
    return named[name](arg)
  }
  if (typeof spec === 'function') return spec
}
/**
 * @param  {obj<cbCreateReducer>} {named}={}
  */
function _cerveza({ named: _named } = {}) {
  const named = {
    ...predefined,
    ..._named
  }
  /**
   * @param  {obj[]} objects The array of objects to reduce
   * @param  {obj} reducers
   */
  return function cerveza(objects, reducers) {
    objects = objects.filter(x => x?.constructor == Object)
    const ret = {}
    for (let [id, reducer] of Object.entries(reducers)) {

      let values = objects.map(object => object[id])
        .flat(Infinity)
        .filter(value => value !== undefined)

      if (typeof reducer == 'function' || typeof reducer == 'string') {
        // treat a single function or string as an array
        reducer = [reducer]
      }

      if (Array.isArray(reducer)) {
        // we have an array, we assume that they are functions
        for (const each of reducer) {
          let fn = getReducer(each, named);
          values = fn(values, objects)
        }
        ret[id] = values
        continue;
      }

      if (isVanillaObject(reducer)) {
        //it's a vanilla object, so recurse for nested properties
        ret[id] = cerveza(values, reducer)
        continue
      }
      console.log(reducer)
      throw new Error('Invalid reducer specified in cerveza.')
    }
    return ret
  }
}


const cerveza = module.exports = _cerveza()
cerveza.cerveza = cerveza
cerveza.create = _cerveza
