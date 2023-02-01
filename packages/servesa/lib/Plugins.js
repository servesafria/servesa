import { DirectoryIndex } from "@servesa/directory-index";
import { Cervezario } from "cervezario";
import { assert, mergeConf, toValueOn } from "./utils.js"

export const Plugins = Servesa => new class ServesaPlugins extends DirectoryIndex {
  constructor() {
    super({ 'plugin.js': Servesa.Plugin })
  }
  createService = async (pluginName, conf, requires = []) => {
    let plugin = this.get(pluginName);
    assert(!!plugin, 500, { message: 'missing plugin', plugin: pluginName })
    await plugin.init()
    assert(plugin.isAllOf(requires), 500, { message: 'bad plugin', plugin: pluginName, is: plugin.is, requires })

    return await plugin.createService(conf);
  }
}


export const Plugins2 = Servesa => new class ServesaPlugins extends Cervezario {
  constructor() {
    super({
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
        assigner: () => ['flat', 'noundef', 'fn', arr => async function (args) {
          let ret = {};
          for (const each of arr) {
            Object.assign(ret, await toValueOn(this, each))
          }
          return ret;
        }],
        fn: () => arr => arr.map(value => (typeof value == 'function' ? value : () => value))
      },
      processor: {
        meta: arr => arr[0],
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
        extending: [{ pick: x => x.meta?.inherits }, 'flat', 'noundef', { map: x => this.get(x) }],
        init: () => async () => {
          //this.parent.init()
        }
      }
    })
  }
  createService = async (pluginName, conf, requires = []) => {
    console.log(this.get(pluginName))
  }
}