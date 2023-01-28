import { stat } from "node:fs/promises"
export default {
  defaults: {
    file: null,
    namespace: "keyv",
  },
  dependencies: {
    'KeySQLite':'@keyv/sqlite'
  },
  extends:"store/key/keyv",
  async info() {
    let fileStat = await stat(this.filename)
    return {
      file: {
        path: this.filename,
        size: fileStat.size.toLocaleString()+' bytes',
      }
    }
  },
  actions: {
    clear: {
      dangerous: true,
      async execute() {
        await this.clear();
        return 'cleared'
      }
    }
  },
  async onLoad({ Servesa, require:{Keyv}, file, namespace }) {
    const filename = this.filename = Servesa.resolve(Servesa.config.paths.data, file);
    this.map = new Keyv('sqlite://' + filename, { namespace });
  }
}