export default {
  dependencies: {
    morgan: 'morgan'
  },
  defaults: {
    format: 'tiny'
  },
  async onLoad({ Servesa, require: { morgan }, format, conf }) {
    Servesa.router.use(morgan(format, conf))
  }
}