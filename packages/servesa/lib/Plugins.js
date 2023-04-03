import { cervezario } from "cervezario";
import { mergeConf, toFlatArray, toValueOn } from "./utils.js"

export const Plugins = Servesa => cervezario({
  extension: '.plugin.js',
  define: {
    assign: () => arr => Object.assign({}, ...arr),
    merge: () => ['flat', 'noundef', arr => mergeConf(...arr)],
    descriptors: () => ['flat', 'noundef', arr => Object.assign({}, ...arr.map(Object.getOwnPropertyDescriptors))],
    caller: () => ['flat', 'noundef', arr => async function (args) {
      for (const each of arr) {
        await each.call(this, { ...this.conf, ...args })
      }
    }],
    assigner: () => ['flat', 'noundef', 'fn', arr => async function (...args) {
      let ret = {};
      for (const each of arr) {
        Object.assign(ret, await toValueOn(this, each, ...args))
      }
      return ret;
    }],
    fn: () => arr => arr.map(value => (typeof value == 'function' ? value : () => value))
  },
  processor: {
    meta: arr => arr[0],
    name: [{ pick: x => x.meta?.name }, arr => arr[0]],
    import: arr => arr.at(-1) || (x => import(x)),
    dependencies: 'assign',
    defaults: 'merge',
    API: 'descriptors',
    configure: ['flat', 'noundef', 'fn', arr => async function (args) {
      for (const each of arr) {
        let value = await toValueOn(this, each, { ...this.conf, ...args })
        this.conf = mergeConf(this.conf, value)
      }
    }],
    setup: ['flat', 'noundef', 'fn', arr => async function (args) {
      for (const each of arr) {
        Object.assign(this, await toValueOn(this, each, { ...this.conf, ...args }))
      }
    }],
    onLoad: 'caller',
    onLoaded: 'caller',
    info: 'assigner',
    actions: 'assign',
    installed: [{ set: false }],
    onInstall: arr => arr.at(-1),
    isAllOf: () => function (requires) {
      return toFlatArray(requires).every(r => this.meta.inherits.includes(r))
    },
    imported: () => ({}),
    required: () => ({}),
    getPlugin: () => name => Servesa.plugins.get(name),
    install: () => async function () {
      if (this.installed) return;
      this.installed = true
      for (const name of this.meta.inherits) {
        await this.getPlugin(name).install();
      }
      for (const [id, dep] of Object.entries(this.dependencies)) {
        let it = this.imported[id] = await this.import(dep)
        this.required[id] = it.default ?? it
      }
      await this.onInstall?.call(this, { Servesa: Servesa.API, plugin: this })
    }
  }
})
