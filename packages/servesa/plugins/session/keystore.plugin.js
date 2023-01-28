import { callbackify } from "@servesa/utils"
export default {
  defaults: {
    store: {
      namespace: 'servesa.session'
    },
  }, configure: {
    store: {
      requires: 'store/key'
    }
  },
  async onLoad({ namespace, store }) {
    const _store = await this.loadService('store', store, 'store/key')
    this.store = ({ Store }) => new class extends Store {
      constructor() {
        super()
        process.nextTick(e => this.emit('connect'))
      }
      get = callbackify(_store.get)
      set = callbackify(_store.set)
      destroy = callbackify(_store.delete)
      all = callbackify(_store.values)
      clear = callbackify(_store.clear)
    }
  }
}