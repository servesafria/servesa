import { DirectoryIndex, Loadable } from "@servesa/directory-index";
import { assert, report, toFlatArray, mergeConf, allMerge, allAssign, allMergeProps, allAsyncMapper, allAsyncReducer } from "./utils.js"

export const Plugin = Servesa => class ServesaPlugin extends Loadable {
  static autoInit = true;
  async install() {
    if (this.#installed) return;
    for (const [id, dep] of Object.entries(this.dependencies)) {
      let it = this.imported[id] = await this.import(dep)
      this.required[id] = it.default ?? it
    }
    await this.spec.onInstall?.call(this, { Servesa: Servesa.API, plugin: this })
    this.#installed = true
  } #installed = false; imported = {}; required = {}

  async init(args) {
    return
    if (this.#installed) return false;
    this.is[this.name] = true
    for (const e of this.extending) {
      if (this.is[e.name]) continue;
      this.is[e.name] = true
      await e.init(args);
    }
    //await this.install()
  }

  #findAllExtending(plugin, ret = new Set()) {
    if (ret.has(plugin)) return ret;
    ret.add(plugin);
    for (const ext of plugin.extending) {
      ext.#findAllExtending(ext, ret)
    }
    ret.delete(plugin);
    ret.add(plugin);
    return ret
  }

  get is() {
    return this.#is ??= this.allExtending.map(x => x.name)
  } #is

  get allExtending() {
    return this.#allExtending ??= [...this.#findAllExtending(this)]
  } #allExtending


  isAllOf(...args) {
    return true
    return toFlatArray(args).every(req => this.is[req])
  }
  get import() {
    return this.#import ??= this.spec.import ?? this.parent?.import ?? (x => import(x))
  } #import

  get extend() {
    return this.#extend ??= toFlatArray(this.parent?.name, this.spec.extend)
  } #extend

  get extending() {
    return this.#extending ??= this.extend.map(x => Servesa.plugins.get(x))
  } #extending

  get defaults() {
    return this.#defaults ??= allMerge(this.allExtending, x => x.spec.defaults)
  } #defaults

  get dependencies() {
    return this.#dependencies ??= allAssign(this.allExtending, x => x.spec.dependencies)
  } #dependencies

  get props() {
    return this.#props ??= allMergeProps(this.allExtending, x => x.spec.API)
  } #props

  get compose() {
    return this.#compose ??= allAssign(this.allExtending, x => x.spec.compose)
  } #compose

  get merge() {
    return this.#merge ??= allAssign(this.allExtending, x => x.spec.merge)
  } #merge

  #extendArray(parentFn, addValues) {
    return toFlatArray(this.extending.map(x => parentFn(x)), addValues)
  }

  get serviceMethods() {
    return this.#serviceMethods ??= {
      //configure: allAsyncReducer(this.allExtending, x=>x.spec.info, mergeConf),
      //setup: allAsyncReducer(this.allExtending, x=>x.spec.setup, (a,b)=>(Object.assign(a,b),x=>x)),
      configure: this.#extendArray(x => x.serviceMethods.configure, this.spec.configure),
      setup: this.#extendArray(x => x.serviceMethods.setup, this.spec.setup),
      info: allAsyncReducer(this.allExtending, x=>x.spec.info, (a,b)=>({...a,...b})),
      onLoad: allAsyncMapper(this.allExtending, x => x.spec.onLoad),
      onLoaded: allAsyncMapper(this.allExtending, x => x.spec.onLoaded)
    }
  } #serviceMethods

  serviceConf = conf => mergeConf({}, this.defaults, conf)

  services = []
  createService = async (conf) => {
    try {
      await this.install()

      let time = performance.now()
      let service = await Servesa.Service.create(this, conf);
      time = performance.now() - time
      report(`Loaded service   ${(conf.name || '<anon>').padEnd(16)} ${this.name.padEnd(32)} ${time.toFixed(0).padStart(5)} ms`)
      return service
    } catch (e) {
      console.error('FAILED SERVICE', conf.name || "<anon>", this.name)
      throw e
    }
  }
}
