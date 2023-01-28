export default {
  dependencies: {
    Keyv: 'keyv'
  },
  defaults: {
    namespace: "keyv",
    ttl: undefined
  },
  info() {
    return {
      hello:'fool',
      size:+this.keys().length
    }
  },
  async onLoaded({ require: { Keyv }, namespace, ttl }) {
    this.map ??= new Keyv({ store: this.store, namespace, ttl });
  }
}