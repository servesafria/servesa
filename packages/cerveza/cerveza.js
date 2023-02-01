
/**
 * Create a processor.
 * @callback cbProcessor
 * @param {any[]} values
 * @param {object[]} objects
 */


/**
 * Create a processor.
 * @callback cbCreateProcessor
 * @param {any} [argument]
 * @return cbProcessor
 */




const isVanillaObject = (object) => object && typeof object === 'object' && Object.getPrototypeOf(object) === Object.prototype

/**
 * @param  {object<cbCreateProcessor>} {define}={}
 */

function createCerveza({ define, processor = arr => arr } = {}) {

  const predefined = {
    all: () => arr => arr,
    override: (defaultValue) => ['noundef',arr => (arr.at(-1) || defaultValue)],
    pick: (picker) => (
      typeof picker == 'string'
        ? (arr, objects) => objects.map(each => each[picker])
        : (arr, objects) => objects.map(picker)
    ),
    props: (processors) => arr => processCollection(arr, processors),
    set: (value) => () => value,
    filter: fn => arr => arr.filter(fn),
    map: fn => arr => arr.map(fn),
    flat: arg => arr => arr.flat(arg ?? Infinity),
    flatMap: fn => arr => arr.flatMap(fn),
    reduce: fn => arr => arr.reduce(fn),
    sort: fn => arr => arr.sort(fn),
    noundef: () => arr => arr.filter(x => x !== undefined)
  }

  const named = {
    ...predefined,
    ...define
  }
  let preset = processor

  function getProcessor(spec) {
    if (typeof spec === 'function') return spec
    if (Array.isArray(spec)) {
      let fns = spec.map(getProcessor);
      return (value,objects) => {
        for (const fn of fns) value = fn(value,objects);
        return value;
      }
    }
    if (typeof spec === 'string') {
      if (!named[spec]) throw new Error('Invalid named processor in cerveza:' + spec + '.')
      return getProcessor(named[spec]())
    }
    if (typeof spec === 'object') {
      let entries = Object.entries(spec);
      if (entries.length !== 1) throw new Error('Invalid processor in cerveza.')
      let [name, arg] = entries[0];
      if (!named[name]) throw new Error('Invalid named processor in cerveza:' + name + '.')
      return getProcessor(named[name](arg))
    }
    throw new Error("Invalid processor specification in cerveza")
  }

  function processArray(values, spec, objects = values) {
    if (isVanillaObject(spec)) {
      return processCollection(values, spec)
    }
    let fn = getProcessor(spec);
    values = fn(values, objects)
    if (Array.isArray(values)) values = [...values]
    return values
  }

  function processCollection(objects, specs) {
    objects = objects.filter(isVanillaObject)
    const ret = {}
    for (let [id, spec] of Object.entries(specs)) {

      let values = objects.map(object => object[id])

      ret[id] = processArray(values, spec, objects)
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


