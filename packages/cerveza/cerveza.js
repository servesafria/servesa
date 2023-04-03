
/**
 * Data processor.
 * @callback pipelineStage
 * @param {any[]|any} value - the input value of the processor
 * @param {object[]} objects - the array of (sub)objects that are currently being processed
 * @returns {any[]|any} - the output of the processor
 */

/**
 * Create a processor spec from an argument.
 * @callback dataProcessorDef
 * @param {any} [argument]
 * @returns {processorPipelineStageSpec}
 */

/**
 * @typedef {string} namedProcessorSpec
 */
/**
 * @typedef {object.<namedProcessorSpec,dataProcessorDef>} namedProcessorDefs
 */
/**
 * @typedef {pipelineStage|namedProcessorSpec} simpleProcessorSpec
 */
/**
 * @typedef {object.<namedProcessorSpec,any>} paramProcessorSpec
 */
/**
 * @typedef {object.<string,processorSpec>} propsProcessorSpec
 */
/**
 * @typedef {simpleProcessorSpec|paramProcessorSpec|processorPipeline} processorPipelineStageSpec
 */
/**
 * @typedef {processorPipelineStageSpec[]} processorPipeline
 */
/**
 * @typedef {processorPipeline|simpleProcessorSpec|propsProcessorSpec} processorSpec
 */



/**
 * @param  {any} value
 * @returns boolean
 */
const isVanillaObject = (value) => value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype

/**
 * @param  {object.<string,dataProcessorDef>} {define}={}
 * @param  {processorSpec} {processor}={}
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

  const defined = {
    ...predefined,
    ...define
  }

  let preset = processor


  /**
   * @param  {processorPipelineStageSpec} spec
   * @returns {pipelineStage}
   */
  function createPipelineStage(spec) {
    if (typeof spec === 'function') return spec;
    if (Array.isArray(spec)) {
      let fns = spec.map(createPipelineStage);
      return (value,objects) => {
        for (const fn of fns) value = fn(value,objects);
        return value;
      }
    }
    if (typeof spec === 'string') {
      if (!defined[spec]) throw new Error('Invalid named processor in cerveza:' + spec + '.')
      return createPipelineStage(defined[spec]())
    }
    if (typeof spec === 'object') {
      let entries = Object.entries(spec);
      if (entries.length !== 1) throw new Error('Invalid processor in cerveza.')
      let [name, arg] = entries[0];
      if (!defined[name]) throw new Error('Invalid named processor in cerveza:' + name + '.')
      return createPipelineStage(defined[name](arg))
    }
    throw new Error("Invalid processor specification in cerveza")
  }
  /**
   * @param  {any[]} values
   * @param  {processorSpec} spec
   * @param  {object[]} objects=values
   */
  function processArray(values, spec, objects = values) {
    if (isVanillaObject(spec)) {
      return processCollection(values, spec)
    }
    let fn = createPipelineStage(spec);
    values = fn(values, objects)
    if (Array.isArray(values)) values = [...values]
    return values
  }

  /**
   * @param  {object[]} objects
   * @param  {propsProcessorSpec} specs
   */
  function processCollection(objects, specs) {
    objects = objects.filter(isVanillaObject)
    const ret = {}
    for (let [id, spec] of Object.entries(specs)) {

      let values = objects.map(object => object[id])

      ret[id] = processArray(values, spec, objects)
    }
    return ret
  }

  // this is the cerveza instance function that we will return
  const cerveza = function cerveza(array, processor = preset) {
    return processArray(array, processor)
  }

  Object.assign(cerveza, {
    // config functions
    define: defs => {
      Object.assign(defined, defs)
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
    // create a new instance of cerveza
    create: createCerveza,
    // allows import { cerveza } from "cerveza"
    cerveza
  })
  return cerveza
}
// allows const cerveza = require('cerveza')
module.exports = createCerveza()


