const { fixName } = require('./utils.js');
 
exports.Extender = class Extender {
  config = {
    //extender options
    getFromString: () => ({ }),
    getParentFromString: () => null,
    generator: null,

    //cerveza options
    processor: [],
    define: {},
  }
  
  
  constructor(config = {}) {
    for (const id in this.config) if (id in config) this.config[id] = config[id];

    const { generator, processor, define } = this.config;
    this.generator = generator || cerveza({ define, processor })
  }
  generate = (input) => {
    const specs = this.collectFor(input)
    return this.generator([...specs])
  }

  collect = (...input) => {
    const specs = new Set()
    for (const each of input) this.#extendWith(specs, each)
    return [...specs]
  }

  #extendWith(current, input) {
    let extension = this.#findSpec(input)

    let extending = [].concat(
      this.#findParent(input),
      this.config.pickExtends(extension)
    ).filter(Boolean)

    current.add(extension); // add temporarily to prevent recursion
    for (const ext of extending) {
      this.#extendWith(current, ext);
    }
    current.remove(extension); // remove and add again to preserve correct order
    current.add(extension);
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
