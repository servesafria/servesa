import { resolve } from "node:path";
import { fileURLToPath } from 'node:url';

import https from "node:https"
import http from "node:http"
import express from "express"
import cookieParser from "cookie-parser"

import { Plugins } from "./Plugins.js";
import { Plugin } from "./Plugin.js";
import { Service } from "./Service.js";
import { Auth } from "./Auth.js"

import { configure } from "./Config.js"
import { Router } from "./Router.js";
import { report, assert, toFlatArray } from "@servesa/utils";
import { DevTools } from "./DevTools.js";
import { ContextFactory } from "./Context.js";
const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const Servesa = new class Servesa {
  Service = Service(this)
  Plugin = Plugin(this)

  plugins = Plugins(this)
  auth = Auth(this);
  

  Router = ({ url = "/" }) => new Router({ url, _parent: this.app })


  _plugins = []
  services = {}
  _services = []

  isProduction = process.env.NODE_ENV === "production"

  DevTools = DevTools(this)
  HTML_HEAD = this.isProduction ? "" : this.DevTools.HOT_RELOAD

  resolve = (...args) => resolve(this.config.root, ...args)

  async start(root) {
    report('[SERVESA] Start')
    this.config = configure(root);
    await this._start(root)
    await this.listen()
    report('-'.repeat(64))
  }

  #serverListen(server, ...args) {
    return new Promise(resolve => {
      server.listen(...args, resolve)
    })
  }

  async listen() {
    for (const conf of toFlatArray(this.config.server)) {
      let url;
      if (conf.origin) {
        url = new URL(conf.origin)
      } else {
        url = new URL('/');
        url.hostname = conf.domain || '*'
        url.port = conf.port
        url.protocol = conf.protocol || 'http:'
      }
      let server;
      if (url.protocol === 'http:') {
        url.port ??= 80
        server = http.createServer(conf, this.app)
      } else if (url.protocol === 'https:') {
        url.port ??= 443
        server = https.createServer(conf, this.app)
      } else {
        assert(false, 500, { message: 'bad protocol', protocol: url.protocol })
      }
      //console.log(url)

      let port = +(conf.port || url.port)
      if (url.hostname === "*") {
        await this.#serverListen(server, port)
      } else {
        await this.#serverListen(server, port, url.hostname)
      }
      report('Listening at ' + conf.origin)
    }
  }

  error = null

  get middleware() {
    return {
      abortOnError: (req, res, next) => {
        if (this.error) throw this.error
        next()
      },
      parseCookies: cookieParser(this.config.secret),
      installContext: async (req, res, next) => {
        res.locals.servesa_ctx = await ContextFactory(this, req, res);
        next()
      },
      handleError: !this.isProduction
        ? this.DevTools.errorHandler
        : (err, req, res, next) => {
          res.contentType('text/plain').status(err.details?.status || 500).send(err.message);
        }

    }
  }
  async _start() {
    if (this.error) return
    let time = performance.now()
    await this.#loadPlugins()
    const mw = this.middleware
    this.app = express()

    //this.app.disable('etag')
    this.app.use([
      mw.abortOnError,
      mw.parseCookies,
      mw.installContext
    ].filter(Boolean))

    !this.isProduction && this.app.get(this.DevTools.hotReloadHandler())
    this.router = new Router({ _self: this.app })
    await this.#loadServices()
    this.router.use(mw.handleError)
    time = performance.now() - time
    report('[CERVEZA] Loaded in ' + (0 | time) + ' ms')
  }

  async #loadPlugins() {
    await this.plugins.loadDirectory(resolve(__dirname, '../plugins'))
    await this.plugins.loadDirectory(this.resolve('plugins'), '', 'local')
    for (const id in this.config.external) {
      let externalPackage = this.config.external[id]
      //let externalModule = await import(externalPackage)
      let externalDirectory = this.resolve('node_modules', externalPackage);
      let pkg = await import(resolve(externalDirectory, 'package.json'))
      await this.plugins.loadDirectory(resolve(externalDirectory, 'plugins'), '', 'external/' + id)
    }
  }

  async #loadServices() {
    for (const conf of this.config.services) {
      if (conf.disabled) continue
      await this.loadService(conf)
    }
  }

  getServices = (requires = []) => Object.values(this.services).filter(service => service.plugin.isAllOf(requires))
  /**
   * Create a new Servesa service or return a previously created service
   * @param  {obj|string} conf  The configuration for the service, including its plugin and optional name, or the name of an existing service.
   * @param  {string|string[]} requires=[] List of plugins that the specified .plugin must extend
   * @returns {promise<service>} The created service
   */


  loadService = async (input, requires = []) => {
    if (typeof input === 'string') {
      let service = this.services[input]
      assert(service, 500, 'unknown service name', { name: input })
      return service;
    }
    let { plugin: pluginName, name, ...conf } = input;
    name ??= pluginName.replace(/[/]/g, "-") + "-" + (Object.keys(this.services).length + 1);
    assert(!this.services[name], "duplicate service name", { name })
    let service = await this.plugins.createService(pluginName, conf, requires);
    service.name=name;
    this.services[name] = service
    return service;
  }

  get API() {
    return {
      Router: this.Router,
      auth: this.auth,
      config: this.config,
      app: this.app,
      router: this.router,
      import: async x => {
        let ret = await import(x)
        return ret
      },
      importDefault: async x => {
        let ret = await import(x)
        return ret.default ?? ret
      },
      loadService: this.loadService,
      plugins: this.plugins,
      services: this.services,
      resolve: this.resolve,
    }
  }
}
