import { dirname, basename } from "path";

export default {
  dependencies: {
    Connector: 'connect-sqlite-3'
  },
  defaults: {
    file: "sessions",
    table: "sessions"
  },
  info() {
    return {
      file: {
        path:this.file
      }
    }
  },
  async onLoad({ Servesa, require: { Connector }, file, table }) {
    const connectSQLite3 = await Connector('connect-sqlite3')

    this.file = Servesa.resolve(Servesa.config.paths.data, file);
    let dir = dirname(this.file)
    let db = basename(this.file)

    const SQLiteStore = connectSQLite3(this.session);
    this.store = new SQLiteStore({ db, table, dir })
  }
}