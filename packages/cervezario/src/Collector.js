exports.Collector = class Collector {
  config = {
    getSpec: _ => (_,{ }),
    getParentName: _ => (_,null),
    pickExtends: (spec) => spec.extends,
  }
  
  
  constructor(config = {}) {
    for (const id in this.config) if (id in config) this.config[id] = config[id];
  }

  collect = (...input) => {
    const specs = new Set()
    const names = new Set();
    for (const each of input) this.#extendWith({specs,names}, each)
    return {specs:[...specs],names:[...names]}
  }

  #extendWith({specs,names}, input) {
    let spec = this.#findSpec(input)
    if (specs.has(spec)) return 
    specs.add(spec); // add temporarily to prevent recursion
    for (const ext of this.#findExtends(input,spec)) {
      this.#extendWith({specs,names}, ext);
    }
    specs.delete(spec); // remove and add again to preserve correct order
    specs.add(spec);
    if (typeof input=='string') names.add(input)
  }
  #findExtends(input,spec) {
    return [].concat(
      this.#findParent(input),
      this.config.pickExtends(spec)
    ).filter(Boolean)
  }
  #findSpec(input) {
    if (typeof input !== 'string') return input;
    return this.config.getSpec(input);
  }
  #findParent(input) {
    if (typeof input !== 'string') return null;
    return this.config.getParentName(input);
  }
}
