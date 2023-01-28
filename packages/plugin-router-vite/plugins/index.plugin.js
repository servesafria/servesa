export default {
  import: x=>import(x),
  dependencies: {
    "vite": "vite"
  },
  defaults: {
    root: 'client',
    base: '/client',
    server: {
      base: '/client',
    }
  },
  async onLoad({
    import: {
      vite: createServer
    },
    plugin,
    name,
    Servesa,
    root,
    server,
    plugins: pluginConfig=[],
    ...rest
  }) {
    let plugins = [];
    for (let pluginConf of pluginConfig) {
      if (typeof pluginConf == 'string') {
        pluginConf = {package:pluginConf}
      }
      let {package:pkg,...options }= pluginConf;
      let plugin = await Servesa.importDefault(pkg);
      plugins.push(plugin(options))
    }

    const vite = await createServer({
      configFile: false,
      plugins,
      publicDir: false,
      ...rest,
      root: this.conf.root = Servesa.resolve(root),
      server: {
        ...server,
        middlewareMode: true
      },
      //appType: 'custom', // don't include Vite's default HTML handling middlewares
    })
    this.router._router.use(vite.middlewares)
  }
}
