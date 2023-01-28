export class Loadable  {
  #loaded = false
  #args = {}
  #file = null
  spec = null   
  static extension = 'js'
  constructor(spec,args={}) {
    this.#args = args;
    if (typeof spec==='string') {
      this.#file = spec;
    } else {
      this.#setSpec(spec)
    }
  }

  async init() {
  }

  async load() {
    if (this.spec) return;
    let spec = await import(this.#file)
    this.#setSpec(spec)
  }
  #setSpec(spec) {
    //console.log('loading',this.constructor.name,this.name||"/")
    if(!spec.default) {
      this.spec = spec;
      console.log('NEW SPEC',this.name)
    } else {
      this.spec = spec.default
      this.OLD = true
    }
  }

  static async create(spec,args) {
    return new this(spec,args);
  }
  static autoInit = false;
  static async init(obj) {
    await obj.load()
    if (this.autoInit) await obj.init(obj.#args)
  }
}
