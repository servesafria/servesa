import { mergeConf } from "./utils.js"

export const Service = Servesa => class ServesaService {
    static async create(plugin, conf) {
      await plugin.install();
      let service = new this(plugin);
      await service.#configure(conf)
      service.#defineProperties(conf)
      await service.#setup()
      return service
    }
    constructor(plugin) {
      this.plugin = plugin;
    }
    async #configure(conf) {
      const {defaults,configure} = this.plugin;
      this.conf = this.userConf = mergeConf({},conf)
      this.conf = mergeConf(defaults, this.conf)
      await configure.call(this, {
        conf:this.conf,
        Servesa:Servesa.API
      });
    }
    
    #defineProperties() {
      const { API:props } = this.plugin || {}
      Object.defineProperties(this, props);
      for (const p in props) {
        const prop = props[p];
        if (typeof prop.value == 'function') {
          this[p] = prop.value.bind(this)
        }
      }
    }

    async #setup() {
      const {setup,onLoad,onLoaded}=this.plugin
      const serviceContext = {
        ...this.conf,
        conf: this.conf,
        import: this.plugin.imported,
        require: this.plugin.required,
        Servesa: Servesa.API
      }
      await setup.call(this,serviceContext)
      await onLoad.call(this,serviceContext)
      await onLoaded.call(this,serviceContext)
    }
  }
 