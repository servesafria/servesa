export default {
  dependencies: {
    'adapter':'keyv-file'
  },
  extend:"store/key/keyv",
  async onLoad({ Servesa, file, import: {adapter} }) {
    const filename = this.filename = Servesa.resolve(Servesa.config.paths.data, file);
    this.store =  new adapter.KeyvFile({ filename })
  }
}