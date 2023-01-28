import { toFlatArray, mergeConf } from "./utils.js"

export const Service = Servesa => class ServesaService {
    static async create(plugin, conf) {
      await plugin.init();
      let service = new this(plugin);
      await service.#configure(conf)
      await service.#setup()
      return service
    }
    constructor(plugin) {
      this.plugin = plugin;
      const { props, compose, merge } = plugin
      Object.defineProperties(this, props);

      for (const p in props) {
        const prop = props[p];
        if (typeof prop.value == 'function') {
          this[p] = prop.value.bind(this)
        }
      }
      for (const c in compose) {
        let merger = compose[c];
        let fns = toFlatArray(plugin.extending.map(p => p.spec[c]), plugin.spec[c]).filter(Boolean)
        this[c] = async (...args) => {
          let result;
          for (const fn of fns) {
            result = await merger(await fn.apply(this, args), result)
          }
          return result;
        }
      }
      for (const prop in merge) {
        let merger = merge[prop];
        let objs = toFlatArray(plugin.extending.map(p => p.spec[prop]), plugin.spec[prop]).filter(Boolean)
        let result;
        for (const obj of objs) {
          result = merger(obj, result)
        }
        this[prop] = result
      }
    }

    async #configure(conf) {
      this.conf = this.userConf = mergeConf(conf)
      this.conf = mergeConf(this.plugin.defaults, this.conf)
      for (const fn of this.plugin.serviceMethods.configure) {
        this.conf = mergeConf(this.conf, typeof fn !== 'function' ? fn : await fn.call(this, {
          ...this.conf,
          conf: this.conf,
          Servesa: Servesa.API
        }))
      }
    }
    async #setup() {
      const serviceContext = {
        ...this.conf,
        conf: this.conf,
        import: this.plugin.imported,
        require: this.plugin.required,
        Servesa: Servesa.API
      }
      for (const fn of this.plugin.serviceMethods.setup) {
        Object.assign(this, (await fn.call(this, serviceContext) || {}))
      }
      await this.plugin.serviceMethods.onLoad.call(this, serviceContext)
      await this.plugin.serviceMethods.onLoaded.call(this, serviceContext)
    }
  }
 