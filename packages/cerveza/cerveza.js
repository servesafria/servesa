
/**
 * Create a processor.
 * @callback cbProcessor
 * @param {any[]} values
 * @param {obj[]} objects
 */


/**
 * Create a processor.
 * @callback cbCreateProcessor
 * @param {any} [argument]
 * @return cbProcessor
 */




const isVanillaObject = (obj) => obj && typeof obj === 'object' && Object.getPrototypeOf(obj) === Object.prototype

/**
 * @param  {obj<cbCreateProcessor>} {define}={}
 */

function createCerveza({ define, processor = arr => arr } = {}) {

  const predefined = {
    all: () => arr => arr,
    override: (defaultValue) => arr => (arr.at(-1) || defaultValue),
    pick: (picker) => (
      typeof picker == 'string'
        ? (arr, objects) => objects.map(each => each[picker])
        : (arr, objects) => objects.map(picker)
    ),
    props: (processors) => arr => processCollection(arr, processors),
    set: (value) => () => value,
    filter: fn => arr => arr.filter(fn),
    map: fn => arr => arr.map(fn),
    flat: arg => arr => arr.flat(arg),
    flatMap: fn => arr => arr.flatMap(fn),
    reduce: fn => arr => arr.reduce(fn),
    sort: fn => arr => arr.sort(fn)
  }

  const named = {
    ...predefined,
    ...define
  }
  let preset = processor

  function getProcessor(spec) {
    if (typeof spec === 'string') {
      if (!named[spec]) throw new Error('Invalid named processor in cerveza:' + spec + '.')
      return named[spec]()
    }
    if (typeof spec === 'object') {
      let entries = Object.entries(spec);
      if (entries.length !== 1) throw new Error('Invalid processor in cerveza.')
      let [name, arg] = entries[0];
      if (!named[name]) throw new Error('Invalid named processor in cerveza:' + name + '.')
      return named[name](arg)
    }
    if (typeof spec === 'function') return spec
  }

  function processArray(values, processor, objects = values) {
    if (typeof processor == 'function' || typeof processor == 'string') {
      // treat a single function or string as an array
      processor = [processor]
    }

    if (Array.isArray(processor)) {
      // we have an array, we assume that they are functions
      for (const each of processor) {
        let fn = getProcessor(each, named);
        values = fn(values, objects)
        if (Array.isArray(values)) values=[...values]
      }
      return values
    }

    if (isVanillaObject(processor)) {
      //it's a vanilla object, so recurse for nested properties
      return processCollection(values, processor)
    }
    throw new Error("Invalid processor specification in cerveza")
  }

  function processCollection(objects, processors) {
    objects = objects.filter(isVanillaObject)
    const ret = {}
    for (let [id, processor] of Object.entries(processors)) {

      let values = objects.map(object => object[id])
        .flat(Infinity)
        .filter(value => value !== undefined)

      ret[id] = processArray(values, processor, objects)
    }
    return ret
  }

  const cerveza = function cerveza(array, processor = preset) {
    return processArray(array, processor)
  }
  Object.assign(cerveza, {
    define: defs => {
      Object.assign(named, defs)
      return cerveza
    },
    processor: proc => {
      preset = proc
      return cerveza
    },
    configure: ({ processor: proc, define: defs }) => {
      processor && cerveza.processor(proc)
      define && cerveza.define(defs)
      return cerveza
    },
    create: createCerveza,
    cerveza
  })
  return cerveza
}

module.exports = createCerveza()


