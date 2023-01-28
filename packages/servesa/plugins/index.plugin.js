import { mergeConf } from "@servesa/utils"

const subs = [];

export default {
  compose: {
    info(it, old) {
      return mergeConf(old ?? {}, it)
    }
  },
  merge: {
    actions(it, old) {
      let ret = mergeConf(old ?? {}, it)
      return ret;
    }
  },
  info: () => ({}),
  actions: {},
  setup({ Servesa }) {
    return {
      loadService: async (id, conf, require) => {
        let sub = await Servesa.loadService(conf, require);
        subs.push({
          super: this,
          sub,
          id
        })
        return sub
      }
    }
  },
  API: {
    get subServices() {
      return subs.filter(x => x.super == this).map(x => ({
        id: x.id,
        service: x.sub
      }))
    },
    get superServices() {
      return subs.filter(x => x.sub == this).map(x => ({
        id: x.id,
        service: x.super
      }))
    },
    action(id, ...args) {
      return this.actions[id].execute.call(this, id, ...args)
    }
  }
} 