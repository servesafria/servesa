import { DirectoryIndex } from "@servesa/directory-index";
import { assert } from "./utils.js"

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
