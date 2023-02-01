import { Stampable } from "@servesa/directory-index";
import {
  assert, report, toValueOn, mergeConf, stamp
} from "./utils.js"

export const Plugin = Servesa => class ServesaPlugin extends Stampable {
  static autoInit = true;
  async install() {
    if (this.#installed) return;
    for (const ext of this.extending) {
      await ext.install();
    }
    for (const [id, dep] of Object.entries(this.dependencies)) {
      let it = this.imported[id] = await this.import(dep)
      this.required[id] = it.default ?? it
    }
    await this.spec.onInstall?.call(this, { Servesa: Servesa.API, plugin: this })
    this.#installed = true
  } #installed = false; imported = {}; required = {}

  stamp = {
    import: arr => arr.at(-1) || (x => import(x)),
    dependencies: stamp.ASSIGN,
    defaults: stamp.MERGE,
    API: stamp.PROPS,
    configure: arr => async function (args) {
      for (const each of arr) {
        let value = await toValueOn(this,each,{ ...this.conf, ...args })
        this.conf = mergeConf(this.conf,value )
      }
    },
    setup: arr => async function (args) {
      for (const each of arr) {
        Object.assign(this, await toValueOn(this,each,{ ...this.conf, ...args }))
      }
    },
    onLoad: stamp.CALLER,
    onLoaded: stamp.CALLER,
    info: stamp.ASSIGNER,
    actions: stamp.ASSIGN
  }


  get import() { return this.stamped.import }

  get defaults() { return this.stamped.defaults }

  get dependencies() { return this.stamped.dependencies }

  get props() { return this.stamped.API }

  serviceConf = conf => mergeConf({}, this.defaults, conf)

  services = []
  createService = async (conf) => {
    try {
      await this.install()
      let time = performance.now()
      let service = await Servesa.Service.create(this, conf);

      service.info = this.stamped.info;
      service.actions = this.stamped.actions;
      time = performance.now() - time
      report(`Loaded service   ${(conf.name || '<anon>').padEnd(16)} ${this.name.padEnd(32)} ${time.toFixed(0).padStart(5)} ms`)
      return service
    } catch (e) {
      console.error('FAILED SERVICE', conf.name || "<anon>", this.name)
      throw e
    }
  }
}

