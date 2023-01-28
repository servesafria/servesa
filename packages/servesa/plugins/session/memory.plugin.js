import { dirname, basename } from "path";

export default {
  dependencies: {
    Store: 'memorystore'
  },
  async onLoad({ Servesa, maxAge, require: { Store } }) {
    this.store = new Store({
      checkPeriod: maxAge
    })
  }
}