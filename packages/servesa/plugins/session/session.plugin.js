export default {
  dependencies: {
    'session': 'express-session'
  },
  defaults: {
    secret: null,
    resave: false,
    saveUninitialized: true,
    maxAge: 86400000
  },
  async onLoad({ require: { session } }) {
    this.session = session;
  },
  async onLoaded({ Servesa }) {
    const { secret, resave, saveUninitialized, maxAge } = this.conf;
    Servesa.router.use(this.session({
      cookie: { maxAge },
      store: this.store(this.session),
      secret: secret || Servesa.config.secret,
      resave,
      saveUninitialized
    }))
  }
}