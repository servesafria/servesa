export default {
  API: {
    get(key) {
      let res = this.map.get(key);
      //console.log('OK',key,res)
      return res
    },
    has(key) {
      return this.map.has(key);
    },
    set(key, val, ttl) {
      return this.map.set(key, val, ttl ?? this.conf.ttl);
    },
    delete(key) {
      return this.map.delete(key);
    },
    clear() {
      return this.map.clear();
    },
    get iterator() {
      return this.map.iterator?.bind(this.map) || this.map.entries?.bind(this.map)
    },
    async entries() {
      let ret = [];
      for await (const entry of this.map.iterator()) ret.push(entry)
      return ret;
    },
    async keys() {
      let ret = [];
      for await (const [key, value] of this.map.iterator()) ret.push(key)
      //console.log(ret)
      return ret;
    },
    async values() {
      let ret = [];
      for await (const [key, value] of this.map.iterator()) ret.push(value)
      return ret;
    }
  }
}